import React, { useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Link,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { deleteUser } from "../api/authApi";


const Header = () => {
    const navigate = useNavigate();
    const [isAuth, setIsAuth] = React.useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const auth = localStorage.getItem("auth");
            setIsAuth(!!auth);
        };

        checkAuth();
        const interval = setInterval(checkAuth, 1000);

        return () => clearInterval(interval);
    }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/login");
  };
  const handleDelete = () => {
    try {
        const auth = JSON.parse(localStorage.getItem("auth"));
        deleteUser(auth.userId);
    } catch (error) {
        console.error("Failed to delete user:", error);
    }
    handleLogout();
  }

  return (
    <Box as="header"
      position="fixed"
      top={0}
      left={0}
      width="100%"  
      bg="#473144"
      color="white"
      px={6}
      py={3}
      zIndex={1000}
      boxShadow="md">
      <Flex justify="space-between" align="center">
        {/* Left Side*/}
        <Link href="/" _hover={{ textDecoration: "none" }}>
          <Text fontSize="xl" fontWeight="bold">
            AnalizeIT
          </Text>
        </Link>

        {/* Right side*/}
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<Avatar size="sm" name="User" />}
            variant="ghost"
            _hover={{ bg: "#1768AC" }}
            _active={{ bg: "#1768AC" }}
          />
          {isAuth && (
          <MenuList color="black">
            <MenuItem onClick={handleLogout}>Log out</MenuItem>
            <MenuItem onClick={handleDelete}>Delete user</MenuItem>
          </MenuList>)
          }
        </Menu>
      </Flex>
    </Box>
  );
};

export default Header;
