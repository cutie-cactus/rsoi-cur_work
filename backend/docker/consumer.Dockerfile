FROM python:3.10-slim-buster

WORKDIR /consumer

COPY ./consumer_service /consumer
COPY ../config.yaml /consumer
COPY ../requirements_kafka.txt /consumer

RUN pip3.10 install --timeout=40 --trusted-host=pypi.org --trusted-host=files.pythonhosted.org --trusted-host=pypi.python.org -r requirements
_kafka.txt

CMD ["python3", "app/main.py"]
