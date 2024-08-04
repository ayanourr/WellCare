import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  Select,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { Field, Form, Formik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userContext from "../../AuthContext/UserContext";
import AuthService from "../../services/auth";

const Signup = () => {
  const [role, setRole] = useState("DOCTOR");
  const { setUser } = useContext(userContext);
  const navigate = useNavigate();
  const toast = useToast();
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

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
        const { accessToken } = loginResponse.data;

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

  const handleSignIn = async (values) => {
    try {
      const response = await AuthService.login(values);
      const { accessToken } = response.data;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(response.data));
      console.log("user logged in successfully ", response.data);
      const token = localStorage.getItem("token");
      setUser(response.data);
      if (token) {
        navigate("/");
      } else {
        console.log("problem");
      }
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred");
    }
  };

  const handleSubmit = async (values, actions) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key !== "attachment" || (values.role === "DOCTOR" && value)) {
        formData.append(key, value);
      }
    });

    if (values.role === "DOCTOR" && values.attachment) {
      formData.append("attachment", values.attachment);
    }

    try {
      await axios.post("http://localhost:8080/api/auth/signup", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      handleSignIn(values);
      toast({
        title: `You signed up successfully. Welcome ${role}!`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred");
      toast({
        title: "Signup failed",
        description: error.response?.data?.message || "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      actions.setSubmitting(false);
    }
  };

  const validate = (values) => {
    const errors = {};
    if (!values.username) {
      errors.username = "Required";
    }
    if (!values.name) {
      errors.name = "Required";
    }
    if (!values.password) {
      errors.password = "Required";
    } else if (values.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    if (!values.email) {
      errors.email = "Required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Invalid email address";
    }
    if (values.role === "DOCTOR") {
      if (!values.degree) {
        errors.degree = "Required";
      }
      if (!values.specialty) {
        errors.specialty = "Required";
      }
      if (!values.attachment) {
        errors.attachment = "Required";
      }
    }
    return errors;
  };

  return (
    <Box>
      <Formik
        initialValues={{
          name: "",
          username: "",
          email: "",
          password: "",
          role: "DOCTOR",
          gender: "",
          specialty: "",
          degree: "",
          attachment: null,
        }}
        validate={validate}
        onSubmit={handleSubmit}
      >
        {(props) => (
          <Form>
            <Field name="username">
              {({ field, form }) => (
                <FormControl
                  mb={4}
                  isInvalid={form.errors.username && form.touched.username}
                >
                  <Input {...field} id="username" placeholder="Username" />
                  <FormErrorMessage>{form.errors.username}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Field name="name">
              {({ field, form }) => (
                <FormControl
                  mb={4}
                  isInvalid={form.errors.name && form.touched.name}
                >
                  <Input {...field} id="name" placeholder="Name" />
                  <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Field name="password">
              {({ field, form }) => (
                <FormControl
                  mb={4}
                  isInvalid={form.errors.password && form.touched.password}
                >
                  <Input
                    {...field}
                    id="password"
                    type="password"
                    placeholder="Password"
                  />
                  <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Field name="email">
              {({ field, form }) => (
                <FormControl
                  mb={4}
                  isInvalid={form.errors.email && form.touched.email}
                >
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="Email"
                  />
                  <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <FormControl mb={4}>
              <Select
                id="role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  props.setFieldValue("role", e.target.value);
                }}
              >
                <option value="DOCTOR">Doctor</option>
                <option value="PATIENT">Patient</option>
              </Select>
            </FormControl>
            {role === "DOCTOR" && (
              <>
                <Field name="degree">
                  {({ field, form }) => (
                    <FormControl
                      mb={4}
                      isInvalid={form.errors.degree && form.touched.degree}
                    >
                      <Input {...field} id="degree" placeholder="Degree" />
                      <FormErrorMessage>{form.errors.degree}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="attachment">
                  {({ form }) => (
                    <FormControl
                      mb={4}
                      isInvalid={
                        form.errors.attachment && form.touched.attachment
                      }
                    >
                      <Input
                        id="attachment"
                        type="file"
                        onChange={(event) => {
                          props.setFieldValue(
                            "attachment",
                            event.target.files[0]
                          );
                        }}
                      />
                      <FormErrorMessage>
                        {form.errors.attachment}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="specialty">
                  {({ field, form }) => (
                    <FormControl
                      mb={4}
                      isInvalid={
                        form.errors.specialty && form.touched.specialty
                      }
                    >
                      <Input
                        {...field}
                        id="specialty"
                        placeholder="Specialty"
                      />
                      <FormErrorMessage>
                        {form.errors.specialty}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              </>
            )}
            <Button
              mt={4}
              colorScheme="teal"
              isLoading={props.isSubmitting}
              type="submit"
              background="#0052cc"
              width="100%"
            >
              Sign Up
            </Button>
            {error && (
              <Box mt={4} color="red.500">
                {error}
              </Box>
            )}
          </Form>
        )}
      </Formik>
      <div className="mt-5">
        <div id="signinDiv"> </div>
      </div>
    </Box>
  );
};

export default Signup;
