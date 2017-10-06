// dependencies
import React from 'react';

const input = ({
  options,
  error,
  value,
  onChange,
}) => ((
  !options.type || options.type === 'text' ? (
    <div className={`input-field col ${options.size || 's4'}`}>
      <input id={options.field} value={value} onChange={onChange} type="text" onBlur={(event) => { event.target.className = !event.target.value ? 'invalid' : ''; }} className={error ? 'invalid' : ''}/>
      <label htmlFor={options.field} className={value ? 'active' : ''} data-error={error || 'Campo obligatorio'}>{options.text}</label>
    </div>
  ) : options.type === 'textarea' ? (
    <div className="input-field col s12">
      <textarea id="{options.field}" onChange={onChange} onBlur={(event) => { event.target.className = !event.target.value ? 'invalid' : ''; }} className={error ? 'invalid' : ''}>{value}</textarea>
      <label data-error={error || 'Campo obligatorio'} className={value ? 'active' : ''} htmlFor="address">{options.text}</label>
    </div>
  ) : <div></div>
));

input.propTypes = {
  options: React.PropTypes.object.isRequired,
  error: React.PropTypes.string,
  value: React.PropTypes.any,

  onChange: React.PropTypes.func,
};

export default input;
