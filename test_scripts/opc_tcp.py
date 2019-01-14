import socket
from kitchen.text.converters import to_bytes
from time import sleep
import colorsys
import time
import calendar

def now():
    return calendar.timegm(time.gmtime())

# DST_IP = "127.0.0.1"
DST_IP = "10.1.1.53"
DST_PORT = 42069
DELAY = 0
FRAMES = 0
START = now()
LAST_PRINT = now()
N_LEDS = 360
HUE = 0.0
SAT = 1.0
VAL = 0.5
RATE = 0.0

def hsv2rgb(hue, sat, val):
  return map(lambda x: (int(x * 255) % 256), colorsys.hsv_to_rgb(hue, sat, val))

def static_rainbow(sock):
  global HUE, SAT, VAL, LAST_PRINT, START, FRAMES, RATE
  while True:
    HUE = (HUE + 0.01) - int(HUE)
    FRAMES += 1
    rgb = hsv2rgb(HUE, SAT, VAL)
    length = N_LEDS * 3
    rgb_data = list(rgb) * N_LEDS
    for channel in range(4):
      data = [channel, 0, length >> 8, length % 0x100] + rgb_data
      sock.sendall(bytes(data))
    if now() - LAST_PRINT > 1:
      RATE = (float)(FRAMES) / (now() - START + 1)
      print((
        "h %+0.2f, s %+0.2f v %+0.2f : %0.2f"
      ) % (
          HUE, SAT, VAL, RATE
      ))
      LAST_PRINT = now()


def main():
  print("destination IP:", DST_IP)
  print("destination port:", DST_PORT)

  sock = socket.socket(socket.AF_INET,  # Internet
                      socket.SOCK_STREAM)  # TCP
  try:
    sock.connect((DST_IP, DST_PORT))
    while 1:
      static_rainbow(sock)
      sleep(DELAY);

      # response = sock.recv(1024)
      # print("response:", response)
  finally:
    sock.close()


if __name__ == "__main__":
  main()
