
function AL_Pepo(){
	
	
	/*TODO : 
	
		change algo for exposure : 
		
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
	
	var pepo_list = Array();
	
	var current_frame = frame.current()
	
	var GENERAL_SENSITIVITY = 1;
	
	MessageLog.trace(all_script_nodes);
	
	var last_value = [];
	var last_index = [];
	
	/*
	EXCUTION
	*/	
	
	
	pepo_list = fetch_pepos(all_script_nodes);
	
	var frame_start = scene.getStartFrame ();
	var frame_scope = scene.getStopFrame ();
	
	write_expo(pepo_list,GENERAL_SENSITIVITY,frame_start,frame_scope);
	
	/*
	FUNCTION 
	*/	
		
	function fetch_pepos(node_list){
		
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
	
	
	function treat_pepos(node_list,active_frame,general_sensitivity){
	
		for(var n = 0 ; n < node_list.length ; n++){
				
			var current_node = node_list[n];
				
			if(node.getEnable(current_node)){
				
				//var input_peg = get_input_peg(current_node);
				var output_read =  get_output_read(current_node);
							
				//MessageLog.trace(input_peg);
				//MessageLog.trace(output_read);
				
				//var X = node.getTextAttr(input_peg,active_frame,'POSITION.X');
				//var Y = node.getTextAttr(input_peg,active_frame,'POSITION.Y');
				
				var i1 = node.getTextAttr(current_node,active_frame,'input_1');
				var i2 = node.getTextAttr(current_node,active_frame,'input_2');
				var sensitivity = node.getTextAttr(current_node,active_frame,'sensitivity');
				var exposure = node.getTextAttr(current_node,active_frame,'exposure');
				
				var currentColumn = get_read_timing_column(output_read);
				
				var sub_timing = column.getDrawingTimings(currentColumn);
				
				var number_of_subs = sub_timing.length;
				
				var current_sub = column.getEntry (currentColumn,1,active_frame-1);
				
				var current_index = sub_timing.indexOf(current_sub);	
				
				var sub_index= current_index ;
				
				var final_sensitivity = 1/sensitivity;
				
				if(active_frame == frame_start){
					
					last_value[n] = i1;
					
					sub_index= 0;
					
				}else{
					
					var distance = i1-last_value[n];
					
					MessageLog.trace("DISTANCE "+distance);

					if(distance > final_sensitivity && ((active_frame % exposure) == 0 )){
						
						var next_index = current_index+1;
						
						if(next_index<number_of_subs){
							
							sub_index=next_index;
	
							
						}else{
							
							sub_index=0;
			
							
						}
						
						last_value[n]= i1;

						
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
		
			treat_pepos(node_list,i,range);
			
		}
		
	}
	
	function clear_timeline(){
		
		
		
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
		
		

		var ispepo = node.getTextAttr(n,current_frame,'isPepo');
		
		MessageLog.trace(ispepo);
		
		if(ispepo == 'Y'){
			
			check = true;
		}
		
		return  check;
		
	}
	
	
	
}
/*
SCRIPT MODULE ATTRIBUTES 


<specs>
  <ports>
    <in type="PEG"/>
    <out type="IMAGE"/>
  </ports>
  <attributes>
<attr type="double" name="input_1" value="0"/> 
<attr type="double" name="input_2" value="0"/> 
<attr type="bool" name="isFupo" value="true"/> 
<attr type="int" name="sensitivity" value="10"/> 
<attr type="int" name="exposure" value="1"/> 
  </attributes>
</specs>




}*/
