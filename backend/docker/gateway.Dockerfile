FROM cr.yandex/mirror/python:3.10-alpine

WORKDIR /gateway

COPY ./gateway_service /gateway
COPY ../config.yaml /gateway
COPY ../requirements.txt /gateway

RUN pip3.10 install --timeout=40 --trusted-host=pypi.org --trusted-host=files.pythonhosted.org --trusted-host=pypi.python.org -r requirements.txt

EXPOSE 8080

CMD ["python3", "app/main.py"]
