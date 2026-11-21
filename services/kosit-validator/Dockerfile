# Pinned official KoSIT Validator + XRechnung 3.0.2 & EN 16931 Schematron daemon
# Runs strictly inside internal_no_egress Docker network with zero internet access.
FROM apps4everything/kosit-validator-xrechnung:latest

ENV JAVA_OPTS="-Xms512m -Xmx1536m -Djavax.xml.accessExternalDTD= -Djavax.xml.accessExternalSchema="

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=10s --start-period=25s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8081/server/health || exit 1
