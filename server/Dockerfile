FROM golang:latest AS builder
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build

FROM alpine:latest
COPY --from=builder /app/leet_invest ./
RUN chmod +x ./leet_invest
EXPOSE 8080
ENV APIKEY 1bcc9d43e5eceb671cfaefb7a49ef506
ENV PORT 8080
ENV HOST 0.0.0.0
ENTRYPOINT ["./leet_invest"]