// dependencies
import React from 'react';
import PropTypes from 'prop-types';

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
  options: PropTypes.object.isRequired,
  error: PropTypes.string,
  value: PropTypes.any,

  onChange: PropTypes.func,
};

export default input;
