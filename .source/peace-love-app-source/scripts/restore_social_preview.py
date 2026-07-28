from __future__ import annotations

import base64
import hashlib
import struct
import zlib
from pathlib import Path

EXPECTED_SHA256 = "6eb3e03070bbae24b4e1a22752addd5727e3e8acecf4d4a0b40253c92f621680"
EXPECTED_SIZE = (1200, 630)
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"

app_root = Path(__file__).resolve().parents[1]
parts_dir = app_root.parent / "social-preview"
output = app_root / "public" / "assets" / "images" / "og-preview-hero-v6.png"
parts = sorted(parts_dir.glob("part-*.txt"))
if not parts:
    raise SystemExit("No social preview payload parts were found.")

payload = "".join(part.read_text(encoding="utf-8").strip() for part in parts)
data = base64.b64decode(payload, validate=True)
actual_sha256 = hashlib.sha256(data).hexdigest()
if actual_sha256 != EXPECTED_SHA256:
    raise SystemExit(f"Social preview SHA-256 mismatch: {actual_sha256}")
if not data.startswith(PNG_SIGNATURE):
    raise SystemExit("Social preview does not have a valid PNG signature.")

position = len(PNG_SIGNATURE)
idat = bytearray()
width = height = None
found_iend = False
while position < len(data):
    if position + 12 > len(data):
        raise SystemExit("PNG ended inside a chunk header.")
    length = struct.unpack(">I", data[position:position + 4])[0]
    chunk_type = data[position + 4:position + 8]
    chunk_data_start = position + 8
    chunk_data_end = chunk_data_start + length
    chunk_end = chunk_data_end + 4
    if chunk_end > len(data):
        raise SystemExit("PNG ended inside a chunk payload.")
    chunk_data = data[chunk_data_start:chunk_data_end]
    expected_crc = struct.unpack(">I", data[chunk_data_end:chunk_end])[0]
    actual_crc = zlib.crc32(chunk_type)
    actual_crc = zlib.crc32(chunk_data, actual_crc) & 0xFFFFFFFF
    if actual_crc != expected_crc:
        raise SystemExit(f"PNG CRC mismatch in {chunk_type.decode('ascii', 'replace')}.")
    if chunk_type == b"IHDR":
        width, height = struct.unpack(">II", chunk_data[:8])
    elif chunk_type == b"IDAT":
        idat.extend(chunk_data)
    elif chunk_type == b"IEND":
        found_iend = True
        position = chunk_end
        break
    position = chunk_end

if (width, height) != EXPECTED_SIZE:
    raise SystemExit(f"Unexpected PNG dimensions: {(width, height)}")
if not found_iend or position != len(data):
    raise SystemExit("PNG is incomplete or has trailing bytes.")
try:
    decoded_pixels = zlib.decompress(bytes(idat))
except zlib.error as exc:
    raise SystemExit(f"PNG image stream failed to decompress: {exc}") from exc
if not decoded_pixels:
    raise SystemExit("PNG image stream decoded to no pixel data.")

output.parent.mkdir(parents=True, exist_ok=True)
output.write_bytes(data)
print(f"Restored {output.name}: {width}x{height}, SHA-256 {actual_sha256}")
