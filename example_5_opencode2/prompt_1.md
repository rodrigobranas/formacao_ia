Implemente um painel de clima no frontend e backend existentes.

O usuário deve poder informar uma cidade e ver o clima atual.

Para obter os dados, use a API Open-Meteo (gratuita, sem necessidade de chave de API):

- API de Geocodificação: https://geocoding-api.open-meteo.com/v1/search (converte o nome da cidade em coordenadas)
- API de Clima: https://api.open-meteo.com/v1/forecast (obtém os dados meteorológicos)

O frontend deve buscar os dados apenas no backend. Opcionalmente, o frontend pode tentar obter a localização do usuário pelo navegador (geolocalização) e sugerir a cidade automaticamente.

Crie um endpoint no backend para o frontend consumir e exibir os dados no painel.
