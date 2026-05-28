FROM cr.yandex/mirror/python:3.10-alpine

WORKDIR /auth

COPY ./auth_service /auth
COPY ../config.yaml /auth
COPY ../requirements.txt /auth

RUN pip3.10 install --timeout=40 --trusted-host=pypi.org --trusted-host=files.pythonhosted.org --trusted-host=pypi.python.org -r requirements.txt

EXPOSE 8888

CMD ["python3", "app/main.py"]
