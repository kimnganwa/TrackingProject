import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useNavigate } from "react-router";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
        const response = await api.post("/auth/login", formData);
        
        toast.success(response.data.message);
        
        localStorage.setItem("token", response.data.token);

        navigate("/");
    } catch (error) {
      console.error("Login failed:", error);

      if (error.response?.status === 401) {
        toast.error("Invalid email or password");
      } else if (error.response?.status === 403) {
        toast.error("Your account is inactive");
      } else {
        toast.error("Login failed");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 shadow-custom-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">
            Project Tracking
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="h-11"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Password
            </label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="h-11"
            />
          </div>

          <Button
            type="submit"
            variant="gradient"
            className="h-11 w-full"
            disabled={!formData.email.trim() || !formData.password.trim()}
            >
            Login
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;