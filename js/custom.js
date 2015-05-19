
/* load drag-and-drop directives -- credit: http://logicbomb.github.io/ng-directives/script/lvl-drag-drop.js 
 * heavily modified Jason Hill, MS 5/13/15*/
angular
.module('lvl.services',[])
.factory('uuid', function() {
    var svc = {
        create: function() {
            function _p8(s) {
                var p = (Math.random().toString(16)+"000000000").substr(2,8);
                return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
            }
            return _p8() + _p8(true) + _p8(true) + _p8();
        },
         
        empty: function() {
          return '00000000-0000-0000-0000-000000000000';
        }
    };
     
    return svc;
});

function getuuid(s) {
        var p = (Math.random().toString(16)+"000000000").substr(2,8);
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
}
//$module = ('lvl.services',[])

var module = angular.module("lvl.directives.dragdrop", ['lvl.services']);

module.directive('lvlDraggable', ['$rootScope', 'uuid', function($rootScope, uuid) {
  return {
    restrict: 'A',
    link: function(scope, el, attrs, controller) {
      $(el).attr("draggable", "true");
      
      var id = $(el).attr("id");
      
      if (!id) {
        id = uuid.create()
        $(el).attr("id", id);
      }
      
      el.bind("dragstart", function(e) {
        // alert("id value is = " + id);
    	e.dataTransfer.setData('text', id);
        $rootScope.$emit("LVL-DRAG-START");
      });
      
      el.bind("dragend", function(e) {
        $rootScope.$emit("LVL-DRAG-END");
      });
    }
  }
}]);
module.directive('lvlDropTarget', ['$rootScope', 'uuid', function($rootScope, uuid) {
  return {
    restrict: 'A',
    scope: {
      onDrop: '&'
    },
    link: function(scope, el, attrs, controller) {
      
      var id = $(el).attr("id");
      
      if (!id) {
        id = getuuid();
        $(el).attr("id", id);
      }
      
      el.bind("dragover", function(e) {
        if (e.preventDefault) {
          e.preventDefault();
        }
        if ($(e.target).hasClass("unmovable")||$(e.target).hasClass("no-drop")) {
        	// nothing
        	
        } else {
        	e.dataTransfer.dropEffect = 'move';
        }
        return false;
      });
      
      el.bind("dragenter", function(e) {
        // this e.target is the current hover target.
        if ($(e.target).hasClass("unmovable")||$(e.target).hasClass("no-drop")) {
        	// do nothing not able to be moved
        	
        } else {
        	$(e.target).addClass('lvl-over');
        	currentOverElement = $(e.target);
        }
      });
      
      el.bind("dragleave", function(e) {
        $(e.target).removeClass('lvl-over');  // this e.target is
															// previous target
															// element.
      });
      
      el.bind("drop", function(e) {
    	//  $(el).removeClass("lvl-target");
    	if (e.preventDefault) {
        	
          e.preventDefault();
        }
        
        if (e.stopPropagation) {
       	  
          e.stopPropagation();
        }
        var data = e.dataTransfer.getData("text");
        var dest = document.getElementById(id);
        var src = document.getElementById(data);
        
        scope.onDrop({dragEl: src, dropEl: dest});
        $rootScope.$emit("LVL-DRAG-END");
      });
      
      $rootScope.$on("LVL-DRAG-START", function() {
        var el = document.getElementById(id);
         	$(el).addClass("lvl-target");
        
      });
      
      $rootScope.$on("LVL-DRAG-END", function() {
    	  
    	 var el = document.getElementById(id);
    	 $(el).removeClass("lvl-target");
        
       	$(currentOverElement).removeClass('lvl-over');
      });
    }
  }
}]);
/* end directives */

document.getElementById("questionHeader").innerHTML="<h3>Placeholdertext</h3>";
document.getElementById("fromHeader").innerHTML="Placeholdertext.";
document.getElementById("toHeader").innerHTML="Placeholdertext";
var correctFeedback;
var inCorrectFeedback;
var correctAnswer;
var itemsCorrect = [];
var tries = 0;
var currentOverElement;
var connector;
var answerString;
var questionData;

function restartQuestion() {
	
	tries=0;
	connector.itemsCorrect = [];
	
	currentOverElement = undefined;
    connector.toggle=0;
    connector.selectedA = [];
    connector.selectedB = [];
     
    connector.listA = questionData.slice(0);
    connector.listB = [];
    connector.items = questionData.slice(0);
    
    connector.checkedA = false;
    connector.checkedB = false;
    document.getElementById("btnCheckAnswer").disabled = true;
    connector.$digest();
	

}

function getQuestionData() {
	// temporary data values initialized
//Move these reset/initialization items at some point
	
	
	
	// temporary data values initialized
	//May go with an array to allow for x targets at some point better to load xml perhaps with JSON
	questionHeaderArray = [];
	questionLabelHeaderArray = [];
	questionColumnTypeArray = []; //used to say if target source or both
	questionCorrectAnswerArray = []; //allows us to give by column correct answers
	questionIncorrectArray = []; //allows us to give by column incorrect answers



	questionData = [
	  {id:0,questionText:'Item 1'},
	  {id:1,questionText:'Item 2'},
	  {id:2,questionText:'Item 3'},
	  {id:3,questionText:'Item 4'},
	  {id:4,questionText:'Item 5'},
	  {id:5,questionText:'Item 6'},
	  {id:6,questionText:'Item 7'},
	  {id:7,questionText:'Item 8'},
	  {id:8,questionText:'Item 9'},
	  {id:9,questionText:'Item 10'}
	  
	];	//Assignment will need to be shifted as it is based on a return value
	correctFeedback = "You correctly showed a mastery of ordered items which will help you in your next learning activity.";
	inCorrectFeedback = "You need mastery of ordered items to proceed to your next learning activity. Retry with the incorrect items.";
	correctAnswer = "0,1,2,3,4,5,6,7,8,9";
	document.getElementById("questionHeader").innerHTML="<h3>Order these by Least to Greatest.</h3>";
	document.getElementById("fromHeader").innerHTML="Drag Items From Here.";
	document.getElementById("toHeader").innerHTML="Drag Items To Here.     &nbsp;&nbsp;&nbsp;&nbsp;Top = Least";
	
	
}
function endOverFocus() {
	for (var i= connector.listB.length; i-->0;) {
	
		
		var hideId = document.getElementById(connector.listB[i].id).parentNode.id;
		var parentItem = document.getElementById(hideId);
		$(parentItem).removeClass('lvl-over');
		
	}
	
	
for (var i= connector.listA.length; i-->0;) {
	
		var hideId = document.getElementById(connector.listB[i].id).parentNode.id;
		var parentItem = document.getElementById(hideId);
		$(parentItem).removeClass('lvl-over');
		
	}
}

function checkAnswer() {
	tries += 1;
	var correctArray = correctAnswer.split(',');
	answerString = "";
	itemsCorrect=[];
	for (var i= connector.listB.length; i-->0;) {
		if (answerString == "") {
			answerString += connector.listB[i].id;
		} else {
			answerString += "," + connector.listB[i].id;
		}
		if (connector.listB[i].id == correctArray[i]) {
			itemsCorrect.push(i);
			var hideId = document.getElementById(connector.listB[i].id).parentNode.id;
			var parentItem = document.getElementById(hideId);
			$(parentItem).addClass('unmovable');
			$(parentItem).removeClass('lg-isolate-scope');
			$(parentItem).attr('draggable', 'false');
		}
	}
	if (itemsCorrect.length != connector.listB.length) {
		document.getElementById("myModalLabel").innerHTML="Corrections Needed";
		
		document.getElementById("myModalBody").innerHTML="<h4>You scored " + itemsCorrect.length + " out of " + connector.listB.length + "</h4></p>" + inCorrectFeedback;
		
	} else {
		document.getElementById("myModalLabel").innerHTML="All Correct - Number of Tries: " + tries;
		document.getElementById("myModalBody").innerHTML="<h4>You scored " + itemsCorrect.length + " out of " + connector.listB.length + ". Number of Tries: " + tries + ".</h4></p>" + correctFeedback;
		document.getElementById("btnCheckAnswer").disabled = true;
	}
	$('#myModal').modal('show');
	
	
}

function ctrlDualList($scope) {
 
  // init
  getQuestionData();	
  $scope.selectedA = [];
  $scope.selectedB = [];
   
  $scope.listA = questionData.slice(0);
  $scope.listB = [];
  $scope.items = questionData.slice(0);
  
  $scope.checkedA = false;
  $scope.checkedB = false;
  connector = $scope;
  function arrayObjectIndexOf(myArray, searchTerm, property) {
      if (myArray == undefined) {
    	  return -1; 
      }
	  for(var i = 0, len = myArray.length; i < len; i++) {
          if (myArray[i][property] === searchTerm) return i;
      }
      return -1;
  }
  
  
  $scope.orderDropA = function() {

		
	    for (i in $scope.selectedA) {
	      var moveId = arrayObjectIndexOf($scope.items, $scope.selectedA[i], "id"); 
	      var insertId = currentOverElement.attr("data-id"); 
	    
	      
	      var insertIndex = arrayObjectIndexOf($scope.listB, eval(insertId), "id");
	      if (insertIndex == -1) {
		    	  insertIndex = $scope.listB.length;
		      }
	      $scope.listB.splice(insertIndex, 0, $scope.items[moveId]);
	      
	      // We have to deal with the issue of .... no more moving the
		  // fixed Correct items...
	      var delIndex= arrayObjectIndexOf($scope.listA, $scope.selectedA[i], "id"); 
	      
	      $scope.listA.splice(delIndex,1);
	      
	      if ($scope.listA.length == 0 ) {
	      	document.getElementById("btnCheckAnswer").disabled = false;
	      }
	    
	      
	    }
		for (i in $scope.selectedB) {
		     
			  var moveId = arrayObjectIndexOf($scope.items, eval($scope.selectedB[i]), "id"); 
		     
		      var insertId = currentOverElement.attr("data-id"); 
		     		      		      
		      var insertIndex = arrayObjectIndexOf($scope.listB, eval(insertId), "id");
		      if (insertIndex == -1) {
		    	  insertIndex = $scope.listB.length;
		      }
		      var delIndex = arrayObjectIndexOf($scope.listB, $scope.selectedB[i], "id"); 
		      
		      var shiftId;
		      var shiftIdArray = [];
		      var shiftIdPositionArray = [];
		      //for (var j = itemsCorrect.length; j-- > 0; ) {
		      for (j = 0; j < itemsCorrect.length; j++) {
		    	  shiftIdArray.push(arrayObjectIndexOf($scope.items, $scope.listB[eval(itemsCorrect[j])].id, "id"));
		      }
		      
		      $scope.listB.splice(delIndex,1);
		      $scope.listB.splice(insertIndex, 0, $scope.items[moveId]);
		      for (var j = itemsCorrect.length; j-- > 0; ) {
		    	  $scope.listB.splice(arrayObjectIndexOf($scope.listB, shiftIdArray[j], "id"),1);
		      }
		      for (var j = itemsCorrect.length; j-- > 0; ) {
		    	  $scope.listB.splice(eval(itemsCorrect[j]), 0, $scope.items[shiftIdArray[j]]);
		      }
		      
		    }
	    reset();
	  };
	  
  
  function reset(){
  	$scope.selectedA=[];
    $scope.selectedB=[];
    $scope.toggle=0;
  }
  
  $scope.toggleA = function() {
    
    if ($scope.selectedA.length>0) {
      $scope.selectedA=[];
    }
    else {
      for (i in $scope.listA) {
        $scope.selectedA.push($scope.listA[i].id);
      }
    }
  }
  
  $scope.toggleB = function() {
    
    if ($scope.selectedB.length>0) {
      $scope.selectedB=[];
    }
    else {
      for (i in $scope.listB) {
        $scope.selectedB.push($scope.listB[i].id);
      }
    }
  }
 
  $scope.drop = function(dragEl, dropEl, direction) {
    
    var drag = $(dragEl);
    var drop = $(dropEl);
    var id = drag.attr("data-id");
    var el = document.getElementById(id);
    if(!$(el).attr("checked")){
      $(el).triggerHandler('click');
    }
    
    direction();
    $scope.$digest();
  };
  
};
  
angular
  .module('myApp', ['lvl.directives.dragdrop']) 
  

$(document).controller('ctrlDualList', ['$scope', ctrlDualList]);

$(document).ready(function() {
	jQuery.event.props.push('dataTransfer'); // prevent conflict with
												// drag-drop
});
        