"""
Send LED data directly over SPI using spidev
"""

import time
from time import sleep
import calendar
import spidev
import itertools

N_LEDS = 360
SPI_HZ = 5000000
SPI_MODE = 0b00

SPIDEVS = []

# may need to uncomment (1,x) if haven't enabled SPI1.
for spi_location in [
    (0, 0),
    (0, 1),
    (1, 0),
    (1, 1)
]:
    spi = spidev.SpiDev()
    spi.open(*spi_location)
    spi.max_speed_hz = SPI_HZ
    spi.mode = SPI_MODE
    SPIDEVS.append(spi)


def hsv2rgb(h, s, v):
    i = int(h * 6)
    f = (h * 6) - i
    p = v * (1 - s)
    q = v * (1 - (f * s))
    t = v * (1 - (s * (1 - f)))

    return [
        (v, t, p),
        (q, v, p),
        (p, v, t),
        (p, q, v),
        (t, p, v),
        (v, p, q)
    ][i % 6]


def rgb2sk9822(r, g, b, brightness=0.1):
    return [
        0xE0 + int(brightness * 0x1f),
        int(b * 255.0),
        int(g * 255.0),
        int(r * 255.0)
    ]


def now():
    return calendar.timegm(time.gmtime())


FRAMES = 0
START = now()
LAST_PRINT = now()
HUE = 0.0
SAT = 1.0
VAL = 0.5
RATE = 0.0


def static_rainbow():
    global HUE, SAT, VAL, LAST_PRINT, START, FRAMES, SPIDEVS, RATE
    while True:
        HUE = (HUE + 0.01) - int(HUE)
        FRAMES += 1
        r, g, b = hsv2rgb(HUE, SAT, VAL)
        data = [0, 0, 0, 0]
        data += (rgb2sk9822(r, g, b)) * N_LEDS
        for spi in SPIDEVS:
            spi.writebytes(data)
        if now() - LAST_PRINT > 1:
            RATE = (float)(FRAMES) / (now() - START + 1)
            print((
                "h %+0.2f, s %+0.2f v %+0.2f | r %0.2f g %0.2f b %0.2f"
                " : %0.2f"
            ) % (
                HUE, SAT, VAL, r, g, b, RATE
            ))
            LAST_PRINT = now()


def flowing_rainbow():
    global HUE, LAST_PRINT, START, FRAMES, SPIDEVS
    while True:
        HUE = (HUE + 0.01) - int(HUE)
        FRAMES += 1
        data = [0, 0, 0, 0]
        data += itertools.chain(*[
            rgb2sk9822(*hsv2rgb(HUE + (float(l) * 0.5 / N_LEDS), SAT, VAL))
            for l in range(0, N_LEDS)
        ])
        for spi in SPIDEVS:
            spi.writebytes(data)
        if now() - LAST_PRINT > 1:
            RATE = float(FRAMES) / (now() - START + 1)
            print("h %+0.2f, s %+0.2f v %+0.2f : %0.2f" % (
                HUE, SAT, VAL, RATE))
            LAST_PRINT = now()


if __name__ == "__main__":
    static_rainbow()
    # flowing_rainbow()
