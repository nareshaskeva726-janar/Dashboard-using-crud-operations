import { Layout, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/authSlice";
// import { useAuth } from "../context/AuthContext";

const { Header } = Layout;

function NavBar({ setOpen }) {
  // const { user } = useAuth();

  const user = useSelector(selectUser); 

  const sidebarColor = "#020024";

  return (


    <Header
      className="flex items-center justify-between px-4 md:px-6"
      style={{ backgroundColor: sidebarColor }}
    >

      {/* Menu Button (hidden on desktop using custom CSS) */}
      <Button
        className="menuButton"
        type="text"
        icon={<MenuOutlined style={{ color: "white", fontSize: 22 }} />}
        onClick={() => setOpen(true)}
      />

      <p></p>

      {/* User Email */}
      <div className="text-white text-sm md:text-base truncate max-w-[220px] md:max-w-none">
        {user ? `User : ${user.email}` : "No User"}
      </div>
    </Header>
  );
}

export default NavBar;