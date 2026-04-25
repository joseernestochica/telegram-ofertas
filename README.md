<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Telegram Dating Bot - PostgreSQL

## Desarrollo

1. Clonar proyecto.
2. Ejectuar ```yarn install```
3. Clonar el archivo ```.env.template``` y renombrarlo a ```.env```
4. Cambiar las variables de entorno
5. Levantar la base de datos en docker: ```docker compose up -d```
6. Ejecutar el SEED para llamar la base de datos:
  ```http://localhost:3020/api/seed```
7. Levantar el modo desarrollo ```yarn start:dev```
8. Establecer el puente con ngrok para recibir las notificaciones de telegram: ```ngrok http http://localhost:3020```
9. Una vez establecido la conexión con ngrok, cambiar la variable WEBAPP_URL del .env con la url que proporcione ngrok
10. Establecer el webhook de telegram con el ngrok. Cambiar el valor url con la que proporciona ngrok: 
  ```
  curl -F "url=https://334b-2a0c-5a82-2101-d000-c46e-e85d-389e-75cf.ngrok-free.app/api/webhook" \
     -F "secret_token=7f3e2d1a9b8c4e6f7a8b9c0d1e2f3a4b" \
     https://api.telegram.org/bot7692336084:AAEm5FqVrbSz6k9qPberpWXVeHQuNOHv1Mk/setWebhook
  ```

