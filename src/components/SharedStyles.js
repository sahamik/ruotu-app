export const inp = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 11,
  color: "#f1f5f9",
  fontSize: 15,
  padding: "11px 13px",
  width: "100%",
  outline: "none",
  fontFamily: "'DM Sans',sans-serif",
  boxSizing: "border-box",
};

export const lbl = {
  color: "#4b5563",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  marginBottom: 5,
  display: "block",
};

export const btnG = (a, b) => ({
  background: `linear-gradient(135deg,${a},${b})`,
  border: "none",
  borderRadius: 13,
  color: "#fff",
  fontSize: 14,
  fontWeight: 800,
  padding: "13px 0",
  cursor: "pointer",
  width: "100%",
  fontFamily: "'DM Sans',sans-serif",
  marginTop: 6,
});

export const cardS = (accent) => ({
  background: "rgba(255,255,255,0.04)",
  borderRadius: 14,
  padding: "14px 15px",
  marginBottom: 9,
  borderLeft: `3px solid ${accent}`,
});
