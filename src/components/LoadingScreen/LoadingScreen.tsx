import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import "./LoadingScreen.scss";

export function LoadingScreen() {
  return (
    <Box className="LoadingScreen" role="status">
      <CircularProgress size={28} />
      <Typography className="LoadingScreenText" component="p">
        Đang mở sổ...
      </Typography>
    </Box>
  );
}
