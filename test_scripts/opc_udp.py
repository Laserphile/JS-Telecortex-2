import socket
from kitchen.text.converters import to_bytes

UDP_IP = "127.0.0.1"
UDP_PORT = 42069
MESSAGE = "Hello, World!"

def main():
  print("UDP target IP:", UDP_IP)
  print("UDP target port:", UDP_PORT)
  print("message:", MESSAGE)

  sock = socket.socket(socket.AF_INET,  # Internet
                      socket.SOCK_DGRAM)  # UDP
  response = sock.sendto(to_bytes(MESSAGE), (UDP_IP, UDP_PORT))
  print("response:", response)


if __name__ == "__main__":
  main()
