
function AL_Pex(){
	
	
	/*TODO : 
	
		change algo for EXPOSURE : 
		
		make a simple loop 
		distance = last point - current point 
		if( distance >= range) 
		{
				upladte last point 
				sub_index ++ (loop) 
				
		}
	
	
	*/
	
	/*
	VARIABLES 
	*/
	
	var all_script_nodes =  node.getNodes(['SCRIPT_MODULE']);
	
	var Pex_list = Array();
	
	var current_frame = frame.current()
	
	var GENERAL_SENSITIVITY = 1;
	var ANIMATION_TYPE = "random";
	
	MessageLog.trace(all_script_nodes);
	
	var last_value = [];
	var last_index = [];
	
	/*
	EXCUTION
	*/	
	
	
	Pex_list = fetch_Pexs(all_script_nodes);
	
	var frame_start = scene.getStartFrame ();
	var frame_scope = scene.getStopFrame ();
	
	write_expo(Pex_list,GENERAL_SENSITIVITY,frame_start,frame_scope);
	
	/*
	FUNCTION 
	*/	
		
	function fetch_Pexs(node_list){
		
		var list = [];
		
		for(var n = 0 ; n < node_list.length ; n++){
			
			var current_node = node_list[n];
			
			MessageLog.trace(current_node);
			
			if(check_node(current_node)){
				
				list.push(current_node);
				
				MessageLog.trace(current_node);
				
			}
	
		}
		
		return list;
			
		
	}
	
	//ajouter condition if peg connected
	
	//deux comportements inputs based and peg based
	
	//get the absolute movement of the peg. 
	
	// check box : absolute mouvement 
	
	// find first child read 
	
	// find first parent peg. 
	
	/*
	
	add randomness
	*/
	
	
	function treat_Pexs(node_list,active_frame,general_SENSITIVITY){
	
		for(var n = 0 ; n < node_list.length ; n++){
				
			var current_node = node_list[n];
				
			if(node.getEnable(current_node)){
				
				//var input_peg = get_input_peg(current_node);
				var output_read =  get_output_read(current_node);
							
				//MessageLog.trace(input_peg);
				//MessageLog.trace(output_read);
				
				//var X = node.getTextAttr(input_peg,active_frame,'POSITION.X');
				//var Y = node.getTextAttr(input_peg,active_frame,'POSITION.Y');
				
				var INPUT1 = node.getTextAttr(current_node,active_frame,'input_1');
				var INPUT2 = node.getTextAttr(current_node,active_frame,'input_2');
				var SENSITIVITY = node.getTextAttr(current_node,active_frame,'sensitivity');
				var EXPOSURE = node.getTextAttr(current_node,active_frame,'exposure');
				var ANIMATION_TYPE = node.getTextAttr(current_node,active_frame,'animation_type');
				
				var currentColumn = get_read_timing_column(output_read);
				
				var sub_timing = column.getDrawingTimings(currentColumn);
				
				var number_of_subs = sub_timing.length;
				
				var current_sub = column.getEntry (currentColumn,1,active_frame-1);
				
				var current_index = sub_timing.indexOf(current_sub);	
				
				var sub_index= current_index ;
				
				var final_SENSITIVITY = 1/SENSITIVITY;
				
				var current_point = {x:INPUT1,y:INPUT2};
				

				
				if(active_frame == frame_start){
					
					last_value[n] = current_point;
					
					sub_index= 0;
					
				}else{
					
				MessageLog.trace(current_point.x);
				MessageLog.trace(current_point.y);
				MessageLog.trace(last_value[n].x);
				MessageLog.trace(last_value[n].y);
				

					
					var dx = current_point.x-last_value[n].x;
					var dy = current_point.y-last_value[n].y;
					
					MessageLog.trace(dx);
					MessageLog.trace(dy);
					
					var distance = Math.sqrt((dx*dx)+(dy*dy));
					
					MessageLog.trace("DISTANCE "+distance);
					
						switch(ANIMATION_TYPE){
								
							case ('loop'):
							
								var next_index = current_index+1;
								
								if(next_index<number_of_subs){
									
			
									sub_index=next_index;
			
									
								}else{
									
									sub_index=0;
					
									
								}
										
								break;
								
							case ('random'):
							
								var random_pool = [];
								
								for(var r= 0; r<number_of_subs-1;r++){
									if(r!=current_index){
										random_pool.push(r);
									}
								}
								
								sub_index =  random_pool[Math.floor(Math.random() * random_pool.length)];
									
									
							break;
								
						}

					if(distance > final_SENSITIVITY && (((active_frame-1) % EXPOSURE) == 0 )){

						last_value[n]= current_point;

						
					}else{
						
						sub_index=current_index 
						
					}


					
						
					
				}
				

				
				
				MessageLog.trace("SUB INDEX "+sub_index);
				
				var SELECTED_SUB = sub_timing[sub_index];
				
				column.setEntry(currentColumn,1,active_frame,SELECTED_SUB);	
				
			}

		}
		
	}
	
	
	function calculate_index_stereo_input(value1,value2,range,scope){
		
		
		
	}

	
	function calculate_index_mono_input(value,range,scope,type){
		
		function remove_sign(n){
			
			return Math.sqrt(n*n);
			
		}	
		
		if(type == "mod"){
			
			//return remove_sign(Math.round(value%((scope-1)/range)));
			
			var flat_value = Math.round(value*range);
			
			return remove_sign(flat_value%(scope-1));

		}
		
		
		if(type == "cos"){
			
			return remove_sign(Math.round(Math.cos(value/range)*(scope-1)));
		}
		
		if(type == 'sin'){
			
			return remove_sign(Math.round(Math.sin(value/range)*(scope-1)));
		}
		
		
		
	}
	
	function write_expo(node_list,range,start_frame,number_of_frames){
		 
		for (var i = start_frame ; i < number_of_frames+1 ; i++){
		
			treat_Pexs(node_list,i,range);
			
		}
		
	}
	
	function get_read_timing_column(read){
		
		for (var i = 0; i < Timeline.numLayers; i++) {

			if (Timeline.layerIsColumn(i)) {

				var currentColumn = Timeline.layerToColumn(i);

				if (column.type(currentColumn) == "DRAWING") {

					var drawing_node = Timeline.layerToNode(i);

					if (drawing_node == read) {

						return currentColumn;
						
					}
				}
			}
		}

	}
	
	function get_input_peg(n){
		
		// RECURSIVE ! find the first PEG in the intput node tree 
		
		var numInput = node.numberOfInputPorts(n);
		
		var first_parent = node.srcNode(n,numInput-1);
		
		var parents = [];
		
		parents.push(node.srcNode(n,numInput-1));
		
		for (var i = 0 ; i < parents.length ; i ++){
			
			var current_parent = parents[i];
			
			if(node.type(current_parent)=="PEG"){
				
				return current_parent;
				
			}else{
				
				numInput = node.numberOfInputPorts(n);
				
				parents.push(node.srcNode(current_parent,numInput-1));
				
			}
			
		}
		

	}
	
	

	function get_output_read(n){
		
		// RECURSIVE ! find the first READ in the outputs node tree 
		
		//var read_list = []
		
		var childrens = []
		
		childrens.push(node.dstNode(n, 0, 0));
		
		for (var i = 0 ; i < childrens.length ; i ++){
			
			var current_child = childrens[i];
			
			if(node.type(current_child)=="READ"){
				
				return current_child;
				
			}else{
				
				childrens.push(node.dstNode(current_child, 0, 0));
			}
			
		}
		
		//return read_list ; 

		
	}

	
	function check_node(n){
		
		var check = false;
		
		

		var isPex = node.getTextAttr(n,current_frame,'isPex');
		
		MessageLog.trace(isPex);
		
		if(isPex == 'Y'){
			
			check = true;
		}
		
		return  check;
		
	}
	
	
	
}
/*
SCRIPT MODULE ATTRIBUTES : PEX 

create script node ans paste this in the "Specifiactions" tab

<specs>
  <ports>
    <in type="PEG"/>
    <out type="IMAGE"/>
  </ports>
  <attributes>
<attr type="bool" name="isPex" value="true"/> 
<attr type="double" name="input_1" value="0"/> 
<attr type="double" name="input_2" value="0"/> 
<attr type="double" name="sensitivity" value="10"/> 
<attr type="int" name="exposure" value="1"/> 
<attr type="Text" name="animation_type" value="loop"/> 
  </attributes>
</specs>





}*/
