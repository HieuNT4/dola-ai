import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import "./Brand.scss";

type BrandProps = {
  href?: string;
};

export function Brand({ href }: BrandProps) {
  const mark = (
    <>
      <Box className="BrandMark" aria-hidden="true">
        D
      </Box>
      <Typography className="BrandName" component="span">
        Dola
      </Typography>
    </>
  );
  if (!href) {
    return <Box className="Brand">{mark}</Box>;
  }
  return (
    <Box className="Brand" component={Link} href={href}>
      {mark}
    </Box>
  );
}
