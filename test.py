import socket
import time

HOST = 'localhost'
PORT = 6000
buf_client = ''
buf_data = ''
AF_INET = 1

# messages may be sent
message1 = 'We should wait for the other phone number'
message2 = 'You will shortly receive the phone number you want'
message3 = 'The phone number you want is '

# creat a TCP socket compatible with IPv4
sock = socket.socket(socket,AF_INET, socket.SOCK_DGRAM)

# bind the socket to the port
server_address = (HOST, PORT)
sock.bind(server_address)

# listen for incoming connection
sock,listen(2)

while True:
    #wait for a connection
    client_sock, client_address = sock.accept()
    data = client_sock.recv(1024)
    data_number = data[-6:]
    if not buf_data:
        buf_data = data_number
        buf_client = client_sock
        sock.sendto(message1,(client_sock,PORT))
    elif cmp(buf_data,data_number)==0:
        sock.sendto(message1,(client_sock,PORT))
    else:
        sock.sendto(message2,(client_sock,PORT))
        time.sleep(5)
        sock.sendto(message3+data_number,(buf_client,PORT))
        sock.sendto(message3+buf_data,(client_sock,PORT))
        break


sock.close()
