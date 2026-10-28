"use client";

import { Brand } from "@/components/Brand/Brand";
import { useSession } from "@/components/SessionProvider/SessionProvider";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState, type FormEvent } from "react";
import "./LoginScreen.scss";

const POINTS = [
  "Mỗi project một sổ riêng",
  "Chi phí quảng cáo, server, tài nguyên và doanh thu",
  "Nhập và đánh giá bằng Mistral",
];

export function LoginScreen() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("nguyenhieuutck57@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không đăng nhập được.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box className="LoginScreen">
      <Box className="LoginScreenBar" component="header">
        <Brand />
      </Box>
      <Box className="LoginScreenBody">
        <Box className="LoginScreenCopy">
          <Typography className="LoginScreenKicker" component="p">
            Sổ sách cho startup
          </Typography>
          <Typography className="LoginScreenTitle" variant="h1" component="h1">
            Theo dõi doanh thu và chi phí <Box className="LoginScreenAccent" component="span">cùng AI</Box>
          </Typography>
          <Typography className="LoginScreenLead" component="p">
            Ghi hoá đơn quảng cáo, server, tài nguyên và tiền về. Mỗi project xem riêng, nhập bằng form hoặc một câu tiếng Việt.
          </Typography>
          <List className="LoginScreenPoints">
            {POINTS.map((point) => (
              <ListItem className="LoginScreenPoint" key={point} disablePadding>
                <Box className="LoginScreenDot" aria-hidden="true" />
                <Typography component="span">{point}</Typography>
              </ListItem>
            ))}
          </List>
        </Box>
        <Box className="LoginScreenCard" component="form" onSubmit={(event) => void handleSubmit(event)}>
          <Typography variant="h2" component="h2">
            Vào sổ
          </Typography>
          <Typography className="LoginScreenHint" component="p">
            Sổ này chỉ mở cho tài khoản của bạn.
          </Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            label="Email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Mật khẩu"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            fullWidth
            required
          />
          <Button className="LoginScreenSubmit" type="submit" variant="contained" disabled={busy} fullWidth>
            {busy ? <CircularProgress size={20} color="inherit" /> : "Vào sổ sách"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
