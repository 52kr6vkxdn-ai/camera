/**
 * NOVA Engine — Logger
 * Emits structured log messages to the EventBus for the console UI.
 */

export const LogLevel = { DEBUG: 'debug', INFO: 'info', WARN: 'warn', ERROR: 'error' };

export class Logger {
  constructor(events) {
    this._events = events;
    this._filters = new Set(['debug','info','warn','error']);
  }

  debug(msg, data) { this._log(LogLevel.DEBUG, msg, data); }
  info(msg, data)  { this._log(LogLevel.INFO,  msg, data); }
  warn(msg, data)  { this._log(LogLevel.WARN,  msg, data); }
  error(msg, data) { this._log(LogLevel.ERROR, msg, data); }

  _log(level, msg, data) {
    const entry = {
      level,
      msg: typeof msg === 'string' ? msg : JSON.stringify(msg),
      data,
      timestamp: new Date().toLocaleTimeString(),
    };
    this._events?.emit('log', entry);

    // Mirror to browser console
    const fn = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    console[fn](`[NOVA ${level.toUpperCase()}]`, entry.msg, data ?? '');
  }
}
