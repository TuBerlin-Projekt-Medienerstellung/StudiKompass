FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY ./scripts /app/scripts

WORKDIR /app/scripts

CMD ["python", "async_extended_search.py"]