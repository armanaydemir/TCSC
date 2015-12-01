import java.util.Scanner;

/**
 * Retrieve number input from user. Do some math. Display.
 * @author Nick Colvin
 * @version 09/05/2014
 */
public class SimpleIOMath {
	private String name;
	private static int age;
	private int favNumber;
	
	/** ask user 3 questions */
	public void promptUser(String [] args) {
		Scanner inputReader = new Scanner(System.in);
		System.out.println("* Sit yourself down, take a seat * \n* All you gotta do is repeat after me * \nQuestion 1: What is your name? ");
		name = inputReader.nextLine();
		System.out.println("Question 2: How old are you? ");
		age = inputReader.nextInt();
		System.out.println("Question 3: What is your favorite number? ");
		favNumber = inputReader.nextInt();
		System.out.println("I'm gonna teach you how to sing it out \nCome on, come on, come on \nLet me tell you what it's all about \nReading, writing, arithmetic \nAre the branches of the learning tree");
		inputReader.close();
	}
	/** converts age to binary
	 * Code taken from http://www.java2novice.com/java-interview-programs/decimal-to-binary/ */
	public void decimalToBinary(int number) {
		int binary[] = new int[25];
		int index = 0;
		while (number>0) {
			binary[index++]=number%2;
			number = number/2;
		}
		System.out.print("Your age in binary is: ");
		for(int i = index-1; i>=0;i--) {
			System.out.print(binary[i]);
		}
	}
	/** prints concatenated info, does math for square of fav number and largest prime factor of age */
	public void printInfo(String [] args) {
		System.out.println("Your name is: " + name);
		System.out.println("Your age is: " + age);
		int primeFactor = 0;
		int testAge = age;
		for(int i=2; i<=testAge;i++) {
			if(testAge%i==0) {
				primeFactor=i;
				testAge=testAge/i;
				i--;
			}
		}
		System.out.println("The first prime factor of " + age + " is: " + primeFactor);
		System.out.println("Your favorite number squared is: " + favNumber*favNumber);
	}
	
	public static void main(String[] args) {
		SimpleIOMath runItHomie = new SimpleIOMath();
		runItHomie.promptUser(args);
		runItHomie.printInfo(args);
		runItHomie.decimalToBinary(age);
		System.out.println("\n* end of program *");
	}
}