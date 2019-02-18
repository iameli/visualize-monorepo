module.exports = ({ clientScript, dot }) => `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        * {
          box-sizing: border-box;
        }

        html,
        body,
        main {
          height: 100%;
          margin: 0;
        }

        body {
          padding: 20px;
        }
      </style>
    </head>
    <body>
      <main></main>
      <script>
        ${clientScript}
      </script>
      <script>
        const dot = ${JSON.stringify(dot)}
        const { width, height } = document
          .querySelector("main")
          .getClientRects()[0];
        d3.select("main")
          .graphviz()
          .width(Math.floor(width))
          .height(Math.floor(height))
          .fit(true)
          .renderDot(dot);
      </script>
    </body>
  </html>
`;
