FROM vanbujm/moonbase-balena:v0.1.0
WORKDIR /usr/src/app
COPY . .
RUN rm -rdf node_modules
RUN yarn
RUN npm run build-server
CMD ["/bin/bash", "./start.sh"]
