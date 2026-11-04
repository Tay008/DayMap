#!/usr/bin/env python3
"""Generate the flat DayMap PWA icons (192 and 512). Standard library only."""
import os
import struct
import zlib

PAPER = (244, 239, 230, 255)
SURFACE = (251, 248, 242, 255)
INK = (21, 19, 15, 255)
ACCENT = (201, 60, 32, 255)


def render(size):
    pixels = [[PAPER for _ in range(size)] for _ in range(size)]

    def rect(x0, y0, x1, y1, color):
        for y in range(max(0, y0), min(size, y1)):
            row = pixels[y]
            for x in range(max(0, x0), min(size, x1)):
                row[x] = color

    margin = max(4, round(size * 0.10))
    border = max(2, round(size * 0.028))
    y1 = round(size * 0.40)
    y2 = round(size * 0.66)
    x1 = round(size * 0.55)

    rect(margin, margin, size - margin, margin + border, INK)
    rect(margin, size - margin - border, size - margin, size - margin, INK)
    rect(margin, margin, margin + border, size - margin, INK)
    rect(size - margin - border, margin, size - margin, size - margin, INK)

    rect(margin + border, margin + border, size - margin - border, size - margin - border, SURFACE)

    rect(margin + border, y1, size - margin - border, y1 + border, INK)
    rect(margin + border, y2, size - margin - border, y2 + border, INK)
    rect(x1, y1 + border, x1 + border, y2, INK)

    rect(margin + border * 3, margin + border * 3, x1 - border * 2, y1 - border * 2, ACCENT)
    return pixels


def write_png(path, size):
    pixels = render(size)
    raw = bytearray()
    for y in range(size):
        raw.append(0)
        for x in range(size):
            raw.extend(pixels[y][x])

    def chunk(kind, data):
        payload = kind + data
        return struct.pack('>I', len(data)) + payload + struct.pack(
            '>I', zlib.crc32(payload) & 0xFFFFFFFF
        )

    ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    with open(path, 'wb') as handle:
        handle.write(b'\x89PNG\r\n\x1a\n')
        handle.write(chunk(b'IHDR', ihdr))
        handle.write(chunk(b'IDAT', zlib.compress(bytes(raw), 9)))
        handle.write(chunk(b'IEND', b''))
    print(path, size)


if __name__ == '__main__':
    public = os.path.join(os.path.dirname(__file__), '..', 'public')
    write_png(os.path.join(public, 'icon-192.png'), 192)
    write_png(os.path.join(public, 'icon-512.png'), 512)
