import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Divider, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset } from '@/constants/theme';

type Operator = '+' | '-' | '*' | '/';

export default function CalculatorScreen() {
  const theme = useTheme();

  const [displayValue, setDisplayValue] = useState<string>('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [expression, setExpression] = useState<string>('');

  const handleDigitPress = (digit: string) => {
    if (displayValue === 'Erro') {
      setDisplayValue(digit);
      setWaitingForOperand(false);
      setExpression('');
      return;
    }

    if (waitingForOperand) {
      setDisplayValue(digit);
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
    }
  };

  const handleDecimalPress = () => {
    if (displayValue === 'Erro') {
      setDisplayValue('0.');
      setWaitingForOperand(false);
      setExpression('');
      return;
    }

    if (waitingForOperand) {
      setDisplayValue('0.');
      setWaitingForOperand(false);
      return;
    }

    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const handleClear = () => {
    setDisplayValue('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setExpression('');
  };

  const handleBackspace = () => {
    if (waitingForOperand || displayValue === 'Erro') {
      return;
    }
    if (displayValue.length > 1) {
      const next = displayValue.slice(0, -1);
      setDisplayValue(next === '-' ? '0' : next);
    } else {
      setDisplayValue('0');
    }
  };

  const handleToggleSign = () => {
    if (displayValue === '0' || displayValue === 'Erro') {
      return;
    }
    const numeric = parseFloat(displayValue);
    setDisplayValue(String(numeric * -1));
  };

  const calculate = (first: number, second: number, op: Operator): number | 'Erro' => {
    switch (op) {
      case '+':
        return Number((first + second).toPrecision(12));
      case '-':
        return Number((first - second).toPrecision(12));
      case '*':
        return Number((first * second).toPrecision(12));
      case '/':
        if (second === 0) {
          return 'Erro';
        }
        return Number((first / second).toPrecision(12));
    }
  };

  const handleOperatorPress = (nextOperator: Operator) => {
    if (displayValue === 'Erro') {
      handleClear();
      return;
    }

    const inputValue = parseFloat(displayValue);

    if (previousValue === null) {
      setPreviousValue(inputValue);
      setExpression(`${inputValue} ${nextOperator}`);
    } else if (operator && !waitingForOperand) {
      const result = calculate(previousValue, inputValue, operator);
      if (result === 'Erro') {
        setDisplayValue('Erro');
        setPreviousValue(null);
        setOperator(null);
        setExpression('');
        setWaitingForOperand(true);
        return;
      }
      setDisplayValue(String(result));
      setPreviousValue(result);
      setExpression(`${result} ${nextOperator}`);
    } else {
      setExpression(`${previousValue} ${nextOperator}`);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const handleEqualsPress = () => {
    if (operator === null || previousValue === null || displayValue === 'Erro') {
      return;
    }

    const inputValue = parseFloat(displayValue);
    const result = calculate(previousValue, inputValue, operator);

    setExpression(`${previousValue} ${operator} ${inputValue} =`);
    setDisplayValue(String(result));
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}>
      <Appbar.Header statusBarHeight={0} elevated>
        <Appbar.Content title="Calculadora Simples" subtitle="React Native Paper" />
        <Appbar.Action icon="refresh" onPress={handleClear} accessibilityLabel="Limpar" />
      </Appbar.Header>

      <View style={styles.container}>
        <Surface style={styles.displaySurface} elevation={2}>
          <Text
            variant="titleMedium"
            style={[styles.expressionText, { color: theme.colors.onSurfaceVariant }]}
            numberOfLines={1}>
            {expression || ' '}
          </Text>
          <Divider style={styles.divider} />
          <Text
            variant="displayMedium"
            style={[styles.displayText, { color: theme.colors.onSurface }]}
            numberOfLines={1}
            adjustsFontSizeToFit>
            {displayValue}
          </Text>
        </Surface>

        <View style={styles.keypad}>
          <View style={styles.row}>
            <Button
              mode="contained-tonal"
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              buttonColor={theme.colors.errorContainer}
              textColor={theme.colors.onErrorContainer}
              onPress={handleClear}>
              C
            </Button>
            <Button
              mode="contained-tonal"
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              onPress={handleToggleSign}>
              +/-
            </Button>
            <Button
              mode="contained-tonal"
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              onPress={handleBackspace}>
              ⌫
            </Button>
            <Button
              mode={operator === '/' ? 'contained' : 'contained-tonal'}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.operatorLabel}
              buttonColor={
                operator === '/' ? theme.colors.primary : theme.colors.secondaryContainer
              }
              textColor={
                operator === '/' ? theme.colors.onPrimary : theme.colors.onSecondaryContainer
              }
              onPress={() => handleOperatorPress('/')}>
              /
            </Button>
          </View>

          <View style={styles.row}>
            {['7', '8', '9'].map((digit) => (
              <Button
                key={digit}
                mode="elevated"
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                onPress={() => handleDigitPress(digit)}>
                {digit}
              </Button>
            ))}
            <Button
              mode={operator === '*' ? 'contained' : 'contained-tonal'}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.operatorLabel}
              buttonColor={
                operator === '*' ? theme.colors.primary : theme.colors.secondaryContainer
              }
              textColor={
                operator === '*' ? theme.colors.onPrimary : theme.colors.onSecondaryContainer
              }
              onPress={() => handleOperatorPress('*')}>
              *
            </Button>
          </View>

          <View style={styles.row}>
            {['4', '5', '6'].map((digit) => (
              <Button
                key={digit}
                mode="elevated"
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                onPress={() => handleDigitPress(digit)}>
                {digit}
              </Button>
            ))}
            <Button
              mode={operator === '-' ? 'contained' : 'contained-tonal'}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.operatorLabel}
              buttonColor={
                operator === '-' ? theme.colors.primary : theme.colors.secondaryContainer
              }
              textColor={
                operator === '-' ? theme.colors.onPrimary : theme.colors.onSecondaryContainer
              }
              onPress={() => handleOperatorPress('-')}>
              -
            </Button>
          </View>

          <View style={styles.row}>
            {['1', '2', '3'].map((digit) => (
              <Button
                key={digit}
                mode="elevated"
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                onPress={() => handleDigitPress(digit)}>
                {digit}
              </Button>
            ))}
            <Button
              mode={operator === '+' ? 'contained' : 'contained-tonal'}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.operatorLabel}
              buttonColor={
                operator === '+' ? theme.colors.primary : theme.colors.secondaryContainer
              }
              textColor={
                operator === '+' ? theme.colors.onPrimary : theme.colors.onSecondaryContainer
              }
              onPress={() => handleOperatorPress('+')}>
              +
            </Button>
          </View>

          <View style={styles.row}>
            <Button
              mode="elevated"
              style={[styles.button, styles.zeroButton]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              onPress={() => handleDigitPress('0')}>
              0
            </Button>
            <Button
              mode="elevated"
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              onPress={handleDecimalPress}>
              .
            </Button>
            <Button
              mode="contained"
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.operatorLabel}
              onPress={handleEqualsPress}>
              =
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: BottomTabInset + 16,
    justifyContent: 'space-between',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  displaySurface: {
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'flex-end',
    minHeight: 140,
  },
  expressionText: {
    textAlign: 'right',
    marginBottom: 8,
    minHeight: 24,
  },
  divider: {
    marginBottom: 12,
    opacity: 0.5,
  },
  displayText: {
    textAlign: 'right',
    fontWeight: '700',
  },
  keypad: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
  },
  zeroButton: {
    flex: 2.15,
  },
  buttonContent: {
    height: 64,
  },
  buttonLabel: {
    fontSize: 22,
    fontWeight: '600',
  },
  operatorLabel: {
    fontSize: 24,
    fontWeight: '700',
  },
});
