import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";

type BasicFormValues = {
  email: string;
  password: string;
};

type TBasicFormProps = {
  onSubmit: (values: BasicFormValues) => void;
};

const BasicForm = ({ onSubmit }: TBasicFormProps) => (
  <div>
    <h1>Any place in your app!</h1>
    <Formik<BasicFormValues>
      initialValues={{ email: "", password: "" }}
      validate={(values) => {
        const errors: Record<string, string> = {};

        if (!values.email) {
          errors.email = "Required";
        } else if (
          !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
        ) {
          errors.email = "Invalid email address";
        }

        if (!values.password) {
          errors.password = "Required";
        } else if (values.password.length < 8) {
          errors.password = "Must be 8 characters or more";
        }

        if (Object.keys(errors).length === 0) {
          // When there are no errors, it should return `void`
          return;
        }

        return errors;
      }}
      onSubmit={(values) => {
        onSubmit(values);
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <Field type="email" name="email" />
          <ErrorMessage name="email" component="div" />
          <Field type="password" name="password" />
          <ErrorMessage name="password" component="div" />
          <button type="submit" disabled={isSubmitting}>
            Submit
          </button>
        </Form>
      )}
    </Formik>
  </div>
);

describe("basic tests", () => {
  // https://formik.org/docs/overview
  it("supports the initial example", async () => {
    const sentinel = jest.fn();
    render(<BasicForm onSubmit={sentinel} />);

    const buttonEl = screen.getByText("Submit");

    expect(screen.getByText("Any place in your app!")).toBeInTheDocument();
    expect(buttonEl).not.toHaveAttribute("disabled");

    // The form is still empty
    await act(async () => {
      fireEvent(
        buttonEl,
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
        })
      );
    });

    // The button is not disabled because there were errors
    expect(buttonEl).not.toHaveAttribute("disabled");
    expect(screen.getAllByText("Required").length).toEqual(2);
    expect(sentinel.mock.calls).toEqual([]);

    // The form but with incorrect values
    await act(async () => {
      fireEvent.change(
        document.querySelector('input[name="email"]') as HTMLElement,
        {
          target: { value: "foo@bar" },
        }
      );
      fireEvent.change(
        document.querySelector('input[name="password"]') as HTMLElement,
        {
          target: { value: "foo" },
        }
      );
      fireEvent.submit(document.querySelector("form") as HTMLElement);
    });

    expect(buttonEl).not.toHaveAttribute("disabled");

    // The previous errors were cleared
    expect(screen.queryAllByText("Required").length).toEqual(0);

    // New errors are shown
    expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    expect(
      screen.getByText("Must be 8 characters or more")
    ).toBeInTheDocument();
    expect(sentinel.mock.calls).toEqual([]);

    // This is a fully correct form
    await act(async () => {
      fireEvent.change(
        document.querySelector('input[name="email"]') as HTMLElement,
        {
          target: { value: "foo@bar.com" },
        }
      );
      fireEvent.change(
        document.querySelector('input[name="password"]') as HTMLElement,
        {
          target: { value: "foobar1234" },
        }
      );
      fireEvent.submit(document.querySelector("form") as HTMLElement);
    });

    expect(sentinel.mock.calls).toEqual([
      [
        {
          email: "foo@bar.com",
          password: "foobar1234",
        },
      ],
    ]);
    // It is disabled until `setIsSubmitting(false)` is called
    expect(screen.getByText("Submit")).toHaveAttribute("disabled");
  });
});
