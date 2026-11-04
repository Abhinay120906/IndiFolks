import mongoose from 'mongoose';

export const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function validId(value) { return mongoose.isValidObjectId(value); }

export function badRequest(res, message) { return res.status(400).json({ message }); }

export function parseJson(value, fallback) {
  if (typeof value === 'object' && value !== null) return value;
  if (typeof value !== 'string') return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

export function safeNumber(v, fallback = 0) {
  if (v === undefined || v === null || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

export function isDateInFuture(v) {
  const date = new Date(v);
  return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
}
