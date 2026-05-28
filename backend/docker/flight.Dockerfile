FROM cr.yandex/mirror/library/python:3.10-alpine

WORKDIR /flight

COPY ./flight_service /flight
COPY ../config.yaml /flight
COPY ../requirements.txt /flight

RUN pip3.10 install --timeout=40 --trusted-host=pypi.org --trusted-host=files.pythonhosted.org --trusted-host=pypi.python.org -r requirements.txt

EXPOSE 8060

CMD ["python3", "app/main.py"]
