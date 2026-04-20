import { useTheme } from "../context/ThemeContext";
import { Button } from "antd";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button onClick={toggleTheme}>
      Switch to {theme === "light" ? "Dark" : "Light"}
    </Button>
  );
}

export default ThemeToggle;