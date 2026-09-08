#!/usr/bin/env python3
"""Read (and clear) the EXIF Orientation tag of a JPEG.

WHY THIS EXISTS: a JPEG can be stored sideways with an EXIF Orientation tag
telling the viewer to rotate it. Browsers honour that tag. `sips -r` rotates
the PIXELS but LEAVES THE TAG, so an image that was already correct on screen
gets rotated a second time by the browser and ships sideways — which is exactly
what happened to Mehta's temple photograph on 8 Sep 2026, and it was invisible
in every local preview that ignores EXIF.

  ./exif-orientation.py read  <file>   -> prints 1..8, or 1 when absent
  ./exif-orientation.py clear <file>   -> rewrites the tag to 1, in place

`clear` only ever writes the value 1. It does NOT rotate pixels, so only clear
a file whose pixels are already the right way up.
"""
import struct, sys

def _find(path):
    d = bytearray(open(path, 'rb').read())
    i = d.find(b'Exif\x00\x00')
    if i < 0:
        return d, None, None
    t = i + 6
    bo = '>' if d[t:t+2] == b'MM' else '<'
    off = struct.unpack_from(bo + 'I', d, t + 4)[0]
    cnt = struct.unpack_from(bo + 'H', d, t + off)[0]
    for k in range(cnt):
        e = t + off + 2 + k * 12
        if struct.unpack_from(bo + 'H', d, e)[0] == 0x0112:
            return d, bo, e + 8
    return d, None, None

def read(path):
    d, bo, at = _find(path)
    return 1 if at is None else struct.unpack_from(bo + 'H', d, at)[0]

def clear(path):
    d, bo, at = _find(path)
    if at is None:
        return False
    if struct.unpack_from(bo + 'H', d, at)[0] == 1:
        return False
    struct.pack_into(bo + 'H', d, at, 1)
    open(path, 'wb').write(d)
    return True

if __name__ == '__main__':
    cmd, f = sys.argv[1], sys.argv[2]
    if cmd == 'read':
        print(read(f))
    elif cmd == 'clear':
        print('cleared' if clear(f) else 'already 1')
