import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  colors: {
    primary: {
      main: "#80b7f6",
    },
    secondary: {
      main: "#5A20CB",
    },
  },
  styles: {
    global: {
      body: {
        background: "linear-gradient(90deg, #5da1ec, #c8e7fa, #FFFFFF)",
        color: "#4f357e",
      },
    },
  },
});
