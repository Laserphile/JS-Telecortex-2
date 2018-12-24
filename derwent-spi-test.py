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

spidevs = []

# may need to uncomment (1,x) if haven't enabled SPI1.
for spi_location in [
    (0,0),
    (0,1),
    (1,0),
    (1,1)
]:
    spi = spidev.SpiDev()
    spi.open(*spi_location)
    spi.max_speed_hz = SPI_HZ
    spi.mode = SPI_MODE
    spidevs.append(spi)

# spi00 = spidev.SpiDev()
# spi00.open(0,0)
# spi00.max_speed_hz = SPI_HZ 
# spi00.mode = SPI_MODE 
#
# spi01 = spidev.SpiDev()
# spi01.open(0,1)
# spi01.max_speed_hz = SPI_HZ 
# spi01.mode = SPI_MODE 
#
# spi10 = spidev.SpiDev()
# spi10.open(1,0)
# spi10.max_speed_hz = SPI_HZ 
# spi10.mode = SPI_MODE 
#
# spi11 = spidev.SpiDev()
# spi11.open(1,1)
# spi11.max_speed_hz = SPI_HZ 
# spi11.mode = SPI_MODE 
#

def hsv2rgb(h, s, v):
    i = int(h*6)
    f = (h*6) - i
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
    ][ i % 6 ]


def rgb2sk9822(r, g, b, brightness=0.1):
    return [
        0xE0 + int(brightness * 0x1f),
        int(b * 255.0),
        int(g * 255.0),
        int(r * 255.0)
    ]

def now():
    return calendar.timegm(time.gmtime())

frames = 0
start = now()
last_print = now()
hue = 0.0
sat = 1.0
val = 0.5
pate = 0.0

def static_rainbow():
    global hue, last_print, sequence, start, frames
    while True:
        hue = (hue + 0.01) - int(hue)
        frames += 1
        r, g, b = hsv2rgb(hue, sat, val)
        data = [0, 0, 0, 0]
        data += (rgb2sk9822(r, g, b)) * N_LEDS
        for spi in spidevs: 
            spi.writebytes(data)
        if(now() - last_print > 1):
            rate = (float)(frames) / (now() - start + 1)
            print("h %+0.2f, s %+0.2f v %+0.2f | r %0.2f g %0.2f b %0.2f : %0.2f" % (
                hue, sat, val, r,g,b, rate ))
            last_print = now()

def flowing_rainbow():
    global hue, last_print, sequence, start, frames
    while True:
        hue = (hue + 0.01) - int(hue)
        frames += 1
        data = [0, 0, 0, 0]
        data += itertools.chain(*[
            rgb2sk9822(*hsv2rgb(hue + (float(l) * 0.5/N_LEDS), sat, val))
            for l in range(0, N_LEDS)
        ])
        for spi in spidevs: 
            spi.writebytes(data)
        if(now() - last_print > 1):
            rate = float(frames) / (now() - start + 1)
            print("h %+0.2f, s %+0.2f v %+0.2f : %0.2f" % (
                hue, sat, val, rate ))
            last_print = now()

if __name__ == "__main__":
    static_rainbow()
    # flowing_rainbow()



