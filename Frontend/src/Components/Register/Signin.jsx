import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  Input,
} from "@chakra-ui/react";
import axios from "axios";
import { Field, Form, Formik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import userContext from "../../AuthContext/UserContext";
import AuthService from "../../services/auth";

const Signin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useContext(userContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleCallbackResponse = async (googleResponse) => {
    try {
      const googleToken = googleResponse.credential;

      const backendResponse = await axios.post(
        "http://localhost:8080/api/auth/google",
        { token: googleToken },
        { headers: { "Content-Type": "application/json" } }
      );

      const { username } = backendResponse.data;
      const password = "defaultPassword";

      // Update formData with username and password
      const updatedFormData = { username: username, password: password };
      setFormData(updatedFormData);

      if (username) {
        const loginResponse = await AuthService.login(updatedFormData);
        const { accessToken, user } = loginResponse.data;

        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(loginResponse.data));

        const token = localStorage.getItem("token");
        setUser(loginResponse.data);
        if (token) {
          navigate("/");
        } else {
          console.log("problem");
        }
      } else {
        console.error("Error: Username not found in Google response.");
        setError("Error: Username not found in Google response.");
      }
    } catch (error) {
      console.error(
        "Error during Google login:",
        error.response ? error.response.data : error.message
      );
      setError(error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id:
          "760729588842-cdf6c87b5h2se598ushnr7pu0vdiorlp.apps.googleusercontent.com",
        callback: handleCallbackResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("signinDiv"),
        { theme: "outline", size: "large" }
      );
    }
  }, [handleCallbackResponse]);

  const handleSubmit = async (values, actions) => {
    try {
      const response = await AuthService.login(values);
      const { accessToken, user } = response.data;

      // Store the token in local storage
      localStorage.setItem("token", accessToken);

      // Store additional user information in local storage
      localStorage.setItem("user", JSON.stringify(response.data));

      if (onLogin) {
        onLogin();
      }
      console.log("user logged in successfully ", response.data);
      const token = localStorage.getItem("token");
      console.log("response.data", response.data);
      setUser(response.data);
      if (token) {
        navigate("/");
      } else {
        console.log("problem");
      }
    } catch (error) {
      setError(error.response.data.message);
    } finally {
      actions.setSubmitting(false); // Set submitting state to false
    }
  };

  return (
    <div>
      <div className="border">
        <Box alignItems={"center"}>
          <Formik
            initialValues={formData}
            validationSchema={Yup.object({
              username: Yup.string().required("Username is required"),
              password: Yup.string().required("Password is required"),
            })}
            onSubmit={handleSubmit}
          >
            {(formikProps) => (
              <Form className="space-y-5">
                <Field name="username">
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={form.errors.username && form.touched.username}
                    >
                      <Input
                        className="w-full"
                        {...field}
                        id="username"
                        placeholder="Username or email"
                        variant="filled"
                        focusBorderColor="#0056b3"
                        color="black" // Ensure text color is black
                      />
                      <FormErrorMessage>
                        {form.errors.username}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="password">
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={form.errors.password && form.touched.password}
                    >
                      <Input
                        className="w-full"
                        {...field}
                        id="password"
                        type="password"
                        placeholder="Password"
                        variant="filled"
                        focusBorderColor="#0056b3"
                        color="black" // Ensure text color is black
                      />
                      <FormErrorMessage>
                        {form.errors.password}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                {error && (
                  <p className="text-red-500" style={{ color: "black" }}>
                    {error}
                  </p>
                )}{" "}
                {/* Display error message if exists */}
                <p className="text-center text-sm" style={{ color: "black" }}>
                  By signing up, you agree to our Terms, Privacy Policy, and
                  Cookies Policy.
                </p>
                <Button
                  className="w-full"
                  mt={4}
                  colorScheme="blue"
                  type="submit"
                  isLoading={formikProps.isSubmitting}
                >
                  Sign In
                </Button>
              </Form>
            )}
          </Formik>
        </Box>
      </div>

      <div className="mt-5">
        <div id="signinDiv"> </div>
      </div>
    </div>
  );
};

export default Signin;
