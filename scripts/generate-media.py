"""Render real Handwork terminal recordings as GIFs and PNG posters.

The input is a macOS script(1) recording made with the -r flag. Pyte applies
its terminal control sequences to a 110 by 38 screen. Pillow draws each screen
with the colors and font attributes emitted by Handwork.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import struct
import pyte

ROOT = Path(__file__).resolve().parents[1]
RECORDING = ROOT / 'content' / 'actual-run.script'
OUT = ROOT / 'public' / 'media'
OUT.mkdir(parents=True, exist_ok=True)

COLS, ROWS = 110, 38
WIDTH, HEIGHT = 1100, 650
FONT_PATH = '/System/Library/Fonts/Menlo.ttc'
if Path(FONT_PATH).exists():
    FONT = ImageFont.truetype(FONT_PATH, 14, index=0)
    BOLD = ImageFont.truetype(FONT_PATH, 14, index=1)
else:
    FONT_PATH = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
    FONT = ImageFont.truetype(FONT_PATH, 14)
    BOLD = FONT
CELL_WIDTH = 9
CELL_HEIGHT = 16
LEFT = (WIDTH - COLS * CELL_WIDTH) // 2
TOP = (HEIGHT - ROWS * CELL_HEIGHT) // 2
BACKGROUND = '#ffffff'
DEFAULT_TEXT = '#202020'


def records():
    raw = RECORDING.read_bytes()
    offset = 0
    while offset + 24 <= len(raw):
        length, seconds, microseconds, direction = struct.unpack_from('<QQIc', raw, offset)
        offset += 24
        payload = raw[offset:offset + length]
        offset += length
        yield seconds + microseconds / 1_000_000, direction, payload
    if offset != len(raw):
        raise ValueError('The terminal recording ended inside a record.')


def cell_color(value, fallback):
    if value == 'default':
        return fallback
    if len(value) == 6 and all(char in '0123456789abcdefABCDEF' for char in value):
        return f'#{value}'
    return fallback


def render(screen):
    image = Image.new('RGB', (WIDTH, HEIGHT), BACKGROUND)
    draw = ImageDraw.Draw(image)
    for row_index in range(ROWS):
        row = screen.buffer.get(row_index, {})
        for column_index in range(COLS):
            cell = row.get(column_index)
            if cell is None or not cell.data:
                continue
            foreground = cell_color(cell.fg, DEFAULT_TEXT)
            background = cell_color(cell.bg, BACKGROUND)
            if cell.reverse:
                foreground, background = background, foreground
            x = LEFT + column_index * CELL_WIDTH
            y = TOP + row_index * CELL_HEIGHT
            if background != BACKGROUND:
                draw.rectangle((x, y, x + CELL_WIDTH, y + CELL_HEIGHT), fill=background)
            if cell.data != ' ':
                draw.text((x, y - 1), cell.data, font=BOLD if cell.bold else FONT, fill=foreground)
            if cell.underscore:
                draw.line((x, y + CELL_HEIGHT - 2, x + CELL_WIDTH, y + CELL_HEIGHT - 2), fill=foreground)
    if not screen.cursor.hidden:
        x = LEFT + screen.cursor.x * CELL_WIDTH
        y = TOP + screen.cursor.y * CELL_HEIGHT
        draw.rectangle((x, y + CELL_HEIGHT - 2, x + CELL_WIDTH, y + CELL_HEIGHT - 1), fill=DEFAULT_TEXT)
    return image


def captured_states():
    screen = pyte.Screen(COLS, ROWS)
    stream = pyte.Stream(screen)
    start = None
    states = []
    previous = None
    for timestamp, direction, payload in records():
        if start is None:
            start = timestamp
        if direction != b'o':
            continue
        if b'\x1b[?1049l' in payload:
            break
        stream.feed(payload.decode('utf-8', 'replace'))
        display = tuple(screen.display)
        if display == previous or not any(line.strip() for line in display):
            continue
        previous = display
        states.append((timestamp - start, render(screen)))
    return states


def save_clip(states, name, start, end):
    selected = [(time, frame) for time, frame in states if start <= time <= end]
    if not selected:
        raise ValueError(f'No frames for {name}.')
    frames = [frame for _, frame in selected]
    durations = []
    for index, (timestamp, _) in enumerate(selected):
        if index + 1 == len(selected):
            durations.append(1800)
            continue
        elapsed = int((selected[index + 1][0] - timestamp) * 1000)
        durations.append(max(80, min(650, elapsed)))
    frames[-1].save(OUT / f'{name}.png', optimize=True)
    frames[0].save(
        OUT / f'{name}.gif',
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        optimize=True,
        disposal=1,
    )
    print(f'{name}: {len(frames)} real terminal states')


states = captured_states()
save_clip(states, 'inspect', 0, 25.8)
save_clip(states, 'verify', 24.0, 38.0)
