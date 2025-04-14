import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getAuth,
  signInWithPhoneNumber,
  ConfirmationResult,
} from '@react-native-firebase/auth';
import {
  Button,
  VStack,
  Text,
  Heading,
  Box,
} from '@gluestack-ui/themed';

const AuthScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  const handleInputChange = (value: string, index: number) => {
    if (/^\d$/.test(value) || value === '') {
      const updatedOtp = [...otp];
      updatedOtp[index] = value;
      setOtp(updatedOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      } else if (!value && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const requestOTP = async () => {
    if (!phoneNumber || !phoneNumber.startsWith('+') || phoneNumber.length < 10) {
      Alert.alert('Please enter a valid phone number with country code.');
      return;
    }

    try {
      setIsLoading(true);
      const auth = getAuth(getApp());
      const result = await signInWithPhoneNumber(auth, phoneNumber);
      setConfirmation(result);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Failed to send OTP', err.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!confirmation) {
      Alert.alert('No OTP confirmation available.');
      return;
    }

    try {
      const code = otp.join('');
      const result = await confirmation.confirm(code);
      console.log('User verified:', result.user);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Verification failed', err.message || 'Try again');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.content}>
        <Box style={styles.card}>
          <VStack space="lg" alignItems="center">
            <Heading size="lg">
              {confirmation ? 'Enter OTP' : 'Phone Login'}
            </Heading>

            {!confirmation ? (
              <>
                <Text>Please Enter Your Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+1234567890"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
                <Button
                  onPress={requestOTP}
                  isDisabled={isLoading}
                  style={styles.button}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Send OTP</Text>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Text>Please Enter Your OTP</Text>
                <View style={styles.otpContainer}>
                  {otp?.map((digit, idx) => (
                    <TextInput
                      key={idx}
                      ref={(ref) => (inputRefs.current[idx] = ref!)}
                      style={styles.otpInput}
                      value={digit}
                      onChangeText={(text) => handleInputChange(text, idx)}
                      onKeyPress={(event) => handleKeyPress(event, idx)}
                      maxLength={1}
                      keyboardType="numeric"
                    />
                  ))}
                </View>
                <Button onPress={verifyCode} style={styles.button}>
                  <Text style={styles.buttonText}>Verify</Text>
                </Button>
              </>
            )}
          </VStack>
        </Box>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    marginTop: 5
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
    width: '100%',
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    backgroundColor: '#fff',
    marginTop: 10
  },
  button: {
    backgroundColor: '#2a8df4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AuthScreen;

