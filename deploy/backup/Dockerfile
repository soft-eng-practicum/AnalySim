FROM postgres:16-alpine

COPY deploy/backup/backup.sh /usr/local/bin/analysim-backup
RUN chmod +x /usr/local/bin/analysim-backup

ENTRYPOINT ["analysim-backup"]
