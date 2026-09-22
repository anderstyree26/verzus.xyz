import { randomInt } from 'node:crypto';

import { ROOM_CODE_LENGTH } from '../constants';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0, 1

/** Generate a short, unambiguous room code. */
export function generateRoomCode(): string {
  let out = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    out += ALPHABET[randomInt(0, ALPHABET.length)];
  }
  return out;
}
