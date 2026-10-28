"use client";

import { Brand } from "@/components/Brand/Brand";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import "./AppShell.scss";

type AppShellProps = {
  email: string;
  onSignOut: () => void;
  children: ReactNode;
};

export function AppShell({ email, onSignOut, children }: AppShellProps) {
  return (
    <Box className="AppShell">
      <Box className="AppShellHeader" component="header">
        <Brand href="/" />
        <Box className="AppShellUser">
          <Typography className="AppShellEmail" component="p">
            {email}
          </Typography>
          <Button type="button" variant="text" onClick={onSignOut}>
            Đăng xuất
          </Button>
        </Box>
      </Box>
      <Box className="AppShellMain" component="main">
        {children}
      </Box>
    </Box>
  );
}
