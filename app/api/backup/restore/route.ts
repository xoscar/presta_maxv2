import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { backupService } from '@/lib/services/backup.service';
import { unauthorized } from '@/lib/problem-details';

const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const ZIP_MAGIC_EMPTY = Buffer.from([0x50, 0x4b, 0x05, 0x06]);

function isZipBuffer(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  return (
    buffer.subarray(0, 4).equals(ZIP_MAGIC) || buffer.subarray(0, 4).equals(ZIP_MAGIC_EMPTY)
  );
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    return unauthorized();
  }

  let file: File;
  try {
    const formData = await request.formData();
    const raw = formData.get('file');
    if (!raw || !(raw instanceof File)) {
      return NextResponse.json(
        {
          type: 'about:blank',
          title: 'Bad Request',
          status: 400,
          detail: 'Se requiere un archivo (campo "file").',
        },
        { status: 400, headers: { 'Content-Type': 'application/problem+json' } }
      );
    }
    file = raw;
  } catch {
    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Bad Request',
        status: 400,
        detail: 'No se pudo leer el formulario.',
      },
      { status: 400, headers: { 'Content-Type': 'application/problem+json' } }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!isZipBuffer(buffer)) {
    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Bad Request',
        status: 400,
        detail: 'El archivo debe ser un ZIP de respaldo de PrestaMax.',
      },
      { status: 400, headers: { 'Content-Type': 'application/problem+json' } }
    );
  }

  try {
    const summary = await backupService.restoreFromBackup(user.id, buffer);
    return NextResponse.json({
      success: true,
      ...summary,
      message: `Restaurado: ${summary.clients} clientes, ${summary.loans} préstamos, ${summary.charges} cargos.`,
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Error al restaurar el respaldo.';
    const isPrismaError =
      err != null && typeof err === 'object' && 'name' in err && err.name === 'PrismaClientKnownRequestError';
    const status = isPrismaError ? 500 : 400;
    return NextResponse.json(
      {
        type: 'about:blank',
        title: status === 500 ? 'Error interno' : 'Error al restaurar',
        status,
        detail: status === 500 ? 'Error inesperado al restaurar. Intenta de nuevo.' : message,
      },
      { status, headers: { 'Content-Type': 'application/problem+json' } }
    );
  }
}
