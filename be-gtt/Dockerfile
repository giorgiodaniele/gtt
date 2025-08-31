# An image for containering Go-based web-server exposing
# port 8080 to the world.
FROM golang:tip-alpine3.22

WORKDIR /app
COPY    . .
RUN     go build -o main .
EXPOSE  8080
CMD    ["/app/main"]