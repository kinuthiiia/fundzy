import "@/styles/globals.css";
import Head from "next/head";
import { MantineProvider, createEmotionCache } from "@mantine/core";
import { withUrqlClient } from "next-urql";

function App({ Component, pageProps }) {
  const myCache = createEmotionCache({
    key: "mantine",
    prepend: false,
  });

  return (
    <>
      <Head>
        <title>Page title</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <MantineProvider
        emotionCache={myCache}
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: "light",
        }}
      >
        <Component {...pageProps} />
      </MantineProvider>
    </>
  );
}

export default withUrqlClient(() => ({
  url: process.env.NEXT_PUBLIC_URL_SERVER_GRAPHQL,
}))(App);
