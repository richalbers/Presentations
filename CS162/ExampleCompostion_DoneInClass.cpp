
//=================================================================================
// Composition Example done in class
// Both .h and .cpp file contents are below. 
// Both are missing file header and comment header blocks 
//=================================================================================
//
// .h file (class definitions)
#ifndef FARM_STUFF
#define FARM_STUFF

class Pig {
public:
	Pig();
private:
	int weight;
	bool isItAlive;
};

//----------------------------------------------------------

class Cow {  
public:
	Cow();
private:
	int weight;
	bool isItAlive;
}; 

//----------------------------------------------------------

class Farm { 
public:
	Farm();
private:  
	Pig favoritePig;  
	Cow cows[3];  
};

#endif

==================================================

// ================================================================================
// .cpp file (class implementations)

#include <iostream>
#include "composition.h"

//----------------------------------------------------------
Pig::Pig() {
	weight=0;
	isItAlive=true;
	std::cout << "Pig has been constructed!\n";
}

//----------------------------------------------------------
Cow::Cow() {
	weight=0;
	isItAlive=true;
	std::cout << "Cow has been constructed!\n";
}

//-----------------------------------------------------
Farm::Farm() {
	std::cout << "Welcome to Old McDonald's farm!\n";
}

//-------------------------------------------------------
void main() {
	Farm oldMcDonalds;
	getchar();
};