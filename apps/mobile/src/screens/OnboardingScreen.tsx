import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { StackScreenProps } from "@react-navigation/stack";
import { useOnboardingStore } from "../stores/onboardingStore";
import { useThemeStore, getThemeColors } from "../stores/themeStore";
import { apiClient } from "../api/client";

type RootStackParamList = {
  Onboarding: undefined;
};

type Props = StackScreenProps<RootStackParamList, "Onboarding">;

export default function OnboardingScreen({ navigation }: Props) {
  const onboardingStore = useOnboardingStore();
  const theme = useThemeStore((state) => state.theme);
  const colors = getThemeColors(theme);
  const [submitting, setSubmitting] = useState(false);

  const { currentStep, draft, submissionState } = onboardingStore;

  const canProceedNext =
    currentStep === 1
      ? draft.profile?.fullName && draft.profile?.dateOfBirth && draft.profile?.nationality
      : currentStep === 2
      ? draft.document?.documentType && draft.document?.documentNumber
      : currentStep === 3
      ? draft.address?.addressLine1 && draft.address?.city && draft.address?.country
      : currentStep === 4
      ? draft.consents?.termsAccepted
      : true;

  const handleNext = () => {
    if (currentStep < 5) {
      onboardingStore.setStep((currentStep + 1) as any);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      onboardingStore.setStep((currentStep - 1) as any);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      onboardingStore.setSubmissionState("submitting");

      await apiClient.submitOnboarding({ draft });

      onboardingStore.setSubmissionState("success");
      Alert.alert("Success", "Onboarding submitted successfully", [
        {
          text: "OK",
          onPress: () => {
            onboardingStore.resetDraft();
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      const errorMsg = error?.error?.message || "Submission failed";
      onboardingStore.setSubmissionError(errorMsg);
      onboardingStore.setSubmissionState("error");
      Alert.alert("Submission Failed", errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          {[1, 2, 3, 4, 5].map((step) => (
            <View key={step} style={styles.stepContainer}>
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor:
                      step <= currentStep ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.stepText,
                    { color: step <= currentStep ? "#FFF" : colors.textSecondary },
                  ]}
                >
                  {step}
                </Text>
              </View>
              <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>
                {step === 1
                  ? "Profile"
                  : step === 2
                  ? "Doc"
                  : step === 3
                  ? "Address"
                  : step === 4
                  ? "Terms"
                  : "Review"}
              </Text>
            </View>
          ))}
        </View>

        {/* Step 1: Profile */}
        {currentStep === 1 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Profile Information
            </Text>
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface,
                  },
                ]}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
                value={draft.profile?.fullName}
                onChangeText={(text) =>
                  onboardingStore.updateProfile({ fullName: text })
                }
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Date of Birth
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface,
                  },
                ]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                value={draft.profile?.dateOfBirth}
                onChangeText={(text) =>
                  onboardingStore.updateProfile({ dateOfBirth: text })
                }
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Nationality
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface,
                  },
                ]}
                placeholder="e.g., US"
                placeholderTextColor={colors.textSecondary}
                value={draft.profile?.nationality}
                onChangeText={(text) =>
                  onboardingStore.updateProfile({ nationality: text })
                }
              />
            </View>
          </View>
        )}

        {/* Step 2: Document */}
        {currentStep === 2 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Document Information
            </Text>
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Document Type
              </Text>
              <View
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <Picker
                  selectedValue={draft.document?.documentType}
                  onValueChange={(value) =>
                    onboardingStore.updateDocument({ documentType: value as any })
                  }
                >
                  <Picker.Item label="Passport" value="PASSPORT" />
                  <Picker.Item label="ID Card" value="ID_CARD" />
                  <Picker.Item label="Driver License" value="DRIVER_LICENSE" />
                </Picker>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Document Number
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface,
                  },
                ]}
                placeholder="e.g., P12345678"
                placeholderTextColor={colors.textSecondary}
                value={draft.document?.documentNumber}
                onChangeText={(text) =>
                  onboardingStore.updateDocument({ documentNumber: text })
                }
              />
            </View>
          </View>
        )}

        {/* Step 3: Address */}
        {currentStep === 3 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Address Information
            </Text>
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Address Line 1
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface,
                  },
                ]}
                placeholder="e.g., 123 Main St"
                placeholderTextColor={colors.textSecondary}
                value={draft.address?.addressLine1}
                onChangeText={(text) =>
                  onboardingStore.updateAddress({ addressLine1: text })
                }
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>City</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface,
                  },
                ]}
                placeholder="e.g., Springfield"
                placeholderTextColor={colors.textSecondary}
                value={draft.address?.city}
                onChangeText={(text) =>
                  onboardingStore.updateAddress({ city: text })
                }
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Country
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface,
                  },
                ]}
                placeholder="e.g., US"
                placeholderTextColor={colors.textSecondary}
                value={draft.address?.country}
                onChangeText={(text) =>
                  onboardingStore.updateAddress({ country: text })
                }
              />
            </View>
          </View>
        )}

        {/* Step 4: Consents */}
        {currentStep === 4 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Terms & Conditions
            </Text>
            <View
              style={[
                styles.consentCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.consentText, { color: colors.text }]}>
                By proceeding, you agree to our terms of service and privacy
                policy.
              </Text>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  {
                    borderColor: colors.primary,
                    backgroundColor: draft.consents?.termsAccepted
                      ? colors.primary
                      : "transparent",
                  },
                ]}
                onPress={() =>
                  onboardingStore.updateConsents({
                    termsAccepted: !draft.consents?.termsAccepted,
                  })
                }
              >
                {draft.consents?.termsAccepted && (
                  <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "bold" }}>
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
              <Text
                style={[
                  styles.checkboxLabel,
                  { color: colors.text },
                ]}
              >
                I accept the terms and conditions
              </Text>
            </View>
          </View>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Review Your Information
            </Text>
            <View
              style={[
                styles.reviewCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <ReviewField
                label="Full Name"
                value={draft.profile?.fullName}
                color={colors}
              />
              <ReviewField
                label="Date of Birth"
                value={draft.profile?.dateOfBirth}
                color={colors}
              />
              <ReviewField
                label="Nationality"
                value={draft.profile?.nationality}
                color={colors}
              />
              <ReviewField
                label="Document Type"
                value={draft.document?.documentType}
                color={colors}
              />
              <ReviewField
                label="Document Number"
                value={draft.document?.documentNumber}
                color={colors}
              />
              <ReviewField
                label="Address"
                value={draft.address?.addressLine1}
                color={colors}
              />
              <ReviewField
                label="City"
                value={draft.address?.city}
                color={colors}
              />
              <ReviewField
                label="Country"
                value={draft.address?.country}
                color={colors}
              />
              <ReviewField
                label="Terms Accepted"
                value={draft.consents?.termsAccepted ? "Yes" : "No"}
                color={colors}
              />
            </View>
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={[styles.navigationButtons, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.button, { opacity: currentStep === 1 ? 0.5 : 1 }]}
            disabled={currentStep === 1}
            onPress={handlePrev}
          >
            <Text style={[styles.buttonText, { color: colors.primary }]}>
              Previous
            </Text>
          </TouchableOpacity>

          {currentStep < 5 ? (
            <TouchableOpacity
              style={[
                styles.nextButton,
                {
                  backgroundColor: colors.primary,
                  opacity: canProceedNext ? 1 : 0.5,
                },
              ]}
              disabled={!canProceedNext}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: colors.success,
                  opacity: submitting ? 0.6 : 1,
                },
              ]}
              disabled={submitting}
              onPress={handleSubmit}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ReviewField({
  label,
  value,
  color,
}: {
  label: string;
  value?: string;
  color: any;
}) {
  return (
    <View style={styles.reviewField}>
      <Text style={[styles.reviewLabel, { color: color.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.reviewValue, { color: color.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  stepContainer: {
    alignItems: "center",
    gap: 4,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  stepText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  stepLabel: {
    fontSize: 10,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  consentCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  consentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  checkboxLabel: {
    fontSize: 14,
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  reviewField: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  reviewLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  navigationButtons: {
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  nextButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  submitButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
