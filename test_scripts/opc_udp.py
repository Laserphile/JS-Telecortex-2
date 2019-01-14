import socket
from kitchen.text.converters import to_bytes

DST_IP = "127.0.0.1"
DST_PORT = 42069
MESSAGE = "Hello, World!"

def main():
  print("destination IP:", DST_IP)
  print("destination port:", DST_PORT)
  print("message:", MESSAGE)

  sock = socket.socket(socket.AF_INET,  # Internet
                      socket.SOCK_DGRAM)  # UDP
  response = sock.sendto(to_bytes(MESSAGE), (DST_IP, DST_PORT))
  print("response:", response)


if __name__ == "__main__":
  main()
