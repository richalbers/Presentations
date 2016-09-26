
#include <stdio.h>

//----------------------------------------
int simpleMath() {
	int x;
	int y;
	int z;

	x=14;
	y=10;

	z=x*y;

	return z;
}

//----------------------------------------
int simpleMath2() {
	int x;

	x=2;

	x*=3;
	x*=4;

	return x;
}

//----------------------------------------
int ifElseFun() {
	int x=7;

	// if
	if (x==5) 
		x++;
	else if (x>6)
		x--;
	else if (x<4)
		x*=2;

	return x;
}
//----------------------------------------
int caseFun() {
	char a='I';
	int b=0;

	switch(a) {
	   case 'A':
		b=1;
		break;

	   case 'E':
		b=3;
		break;

	   case 'I':
		b=42;
		break;

	   case 'O':
		b=100;
		break;

	   case 'U':
		b=101;
		break;
	}

	return b;
}
//----------------------------------------
int loopFun() {
	int x=2;
	int y=3;

	// for loop
	for(x=0; x<=2; x++) {
		y=y*3;
	}

	return y;	
}

//----------------------------------------
int loopFun2() {
	int x=3;
	int y=0;
	
	while(x>0) {
		y+=5;
		x--;
	}

	return y;	
}

//------------------------------
// parameters
int funcArgs(int p1, int p2) {
	int x=0;
	int y=2;
	
	x=p1 + p2 + y;

	return x;
}

//------------------------------
//funcCall
int funcCall() {
	int y;
	y=funcArgs(5,10);
	return y;
}
//------------------------------
int main() {
	int x,y;
	x=simpleMath();

	printf("simpleMath() = %d\n", x); 

	x=simpleMath2();
	printf("simpleMath2() = %d\n",x); 
	
	x=ifElseFun();
	printf("ifElseFun() = %d\n", x); 
 

	x=caseFun();
	printf("caseFun() = %d\n", x); 

	x=loopFun();
	printf("loopFun() = %d\n", x); 

	x=loopFun2();
	printf("loopFun2() = %d\n", x); 
}

