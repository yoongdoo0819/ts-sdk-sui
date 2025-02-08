module tensorflowsui::graph {


    use std::debug;

    const NONE : u64= 0;
    const RELU : u64= 1;
    const SOFTMAX : u64 = 2;

    use tensorflowsui::tensor::{
        SignedFixedTensor, get_scale,get_magnitude,get_shape,get_sign,
        create_signed_fixed,
        scale_up,
        debug_print_tensor
    };

    public struct SignedFixedLayer has copy, drop {
        name: vector<u8>,
        layer_type: vector<u8>,
        in_dim: u64,
        out_dim: u64,
        weight_tensor: SignedFixedTensor,  
        bias_tensor: SignedFixedTensor,   
    }

    public struct SignedFixedGraph has drop {
        layers: vector<SignedFixedLayer>,
    }

    public fun create_signed_graph(): SignedFixedGraph {
        SignedFixedGraph { layers: vector::empty<SignedFixedLayer>() }
    }

    public fun get_weight_tensor(layer: &SignedFixedLayer): &SignedFixedTensor {
        &layer.weight_tensor
    }

    public fun get_bias_tensor(layer: &SignedFixedLayer): &SignedFixedTensor {
        &layer.bias_tensor
    }


    public fun DenseSignedFixed(
        graph: &mut SignedFixedGraph,
        in_dim: u64,
        out_dim: u64,
        name: vector<u8>,
        scale: u64
    ): SignedFixedLayer {
        let weight_count = in_dim * out_dim;
        let mut mag_w = vector::empty<u64>();
        let mut sgn_w = vector::empty<u64>();

        let mut i = 0;
        while (i < weight_count) {
            vector::push_back(&mut mag_w, 1);  
            vector::push_back(&mut sgn_w, 0);  
            i = i + 1;
        };

        let weight_tensor = create_signed_fixed(
            vector[in_dim, out_dim],
            mag_w,
            sgn_w,
            scale
        );

        // bias
        let mut mag_b = vector::empty<u64>();
        let mut sgn_b = vector::empty<u64>();

        let mut j = 0;
        while (j < out_dim) {
            vector::push_back(&mut mag_b, 0);
            vector::push_back(&mut sgn_b, 0);
            j = j + 1;
        };
        let bias_tensor = create_signed_fixed(
            vector[out_dim],
            mag_b,
            sgn_b,
            scale
        );

        let layer = SignedFixedLayer {
            name,
            layer_type: b"dense_sf",
            in_dim,
            out_dim,
            weight_tensor,
            bias_tensor
        };

        vector::push_back(&mut graph.layers, layer);
        layer
    }

    public fun set_layer_weights_signed_fixed(
        graph: &mut SignedFixedGraph,
        name: vector<u8>,
        weight_magnitude: vector<u64>,
        weight_sign: vector<u64>,
        bias_magnitude: vector<u64>,
        bias_sign: vector<u64>,
        in_dim: u64,
        out_dim: u64,
        scale: u64
    ) {
        let len = vector::length(&graph.layers);
        let mut i = 0;
        while (i < len) {
            let layer = vector::borrow_mut(&mut graph.layers, i);
            if (layer.name == name) {

                layer.weight_tensor = create_signed_fixed(
                    vector[in_dim, out_dim],
                    weight_magnitude,
                    weight_sign,
                    scale
                );
                layer.bias_tensor = create_signed_fixed(
                    vector[out_dim],
                    bias_magnitude,
                    bias_sign,
                    scale
                );
                return;
            };
            i = i + 1;
        };
        abort 4444;
    }

    public fun get_layer_signed_fixed(graph: &SignedFixedGraph, name: vector<u8>): &SignedFixedLayer {
        let mut i = 0;
        while (i < vector::length(&graph.layers)) {
            let layer = vector::borrow(&graph.layers, i);
            if (layer.name == name) {
                return layer;
            };
            i = i + 1;
        };
        abort 9999
    }


    public fun apply_dense_signed_fixed(
        input_tensor: &SignedFixedTensor,
        weight_tensor: &SignedFixedTensor,
        bias_tensor: &SignedFixedTensor
    ): SignedFixedTensor {

        let batch = *vector::borrow(&get_shape(input_tensor), 0);
        let in_dim = *vector::borrow(&get_shape(input_tensor), 1);
        let w_in = *vector::borrow(&get_shape(weight_tensor), 0);
        let w_out= *vector::borrow(&get_shape(weight_tensor), 1);
        let b_out= *vector::borrow(&get_shape(bias_tensor), 0);

        assert!(in_dim == w_in, 10001);
        assert!(w_out == b_out, 10002);

        let s =  get_scale(input_tensor);
        assert!(s == get_scale(weight_tensor), 10003);
        assert!(s == get_scale(bias_tensor),   10004);

        let mut out_shape = vector::empty<u64>();
        vector::push_back(&mut out_shape, batch);
        vector::push_back(&mut out_shape, w_out);

        let mut out_mag = vector::empty<u64>();
        let mut out_sign= vector::empty<u64>();

        let mut b_idx = 0;
        while (b_idx < batch) {
            let mut j_idx = 0;
            while (j_idx < w_out) {

                let mut acc_sgn = 0;
                let mut acc_mag = 0;
                let mut i_idx = 0;
                while (i_idx < in_dim) {
                    let in_index = b_idx*in_dim + i_idx;
                    let w_index  = i_idx*w_out + j_idx;
                                                   
                    let in_s = *vector::borrow(& get_sign(input_tensor), in_index);
                    let in_m = *vector::borrow(&get_magnitude(input_tensor), in_index);
                    let w_s  = *vector::borrow(&get_sign(weight_tensor), w_index);
                    let w_m  = *vector::borrow(&get_magnitude(weight_tensor), w_index);

                    let mul_s = if (in_s == w_s) { 0 } else { 1 };
                    let mul_m = in_m * w_m;

                    let (acc2_s, acc2_m) = signed_add_element(
                        acc_sgn, acc_mag,
                        mul_s,   mul_m
                    );
                    acc_sgn = acc2_s;
                    acc_mag = acc2_m;

                    i_idx = i_idx + 1;
                };

                let factor = scale_up(1, s);
                let b_s  = *vector::borrow(&get_sign(bias_tensor), j_idx);
                let b_m  = *vector::borrow(&get_magnitude(bias_tensor), j_idx);
                let b_m_2s = b_m * factor;

                let (acc3_s, acc3_m) = signed_add_element(
                    acc_sgn, acc_mag,
                    b_s,     b_m_2s
                );
                let mut final_s = acc3_s;
                let mut final_m = acc3_m;
                if (final_s == 1) {
                    final_s = 0;
                    final_m = 0;
                };


                let divisor = scale_up(1, s);
                let rounded_m = final_m / divisor;

                vector::push_back(&mut out_sign, final_s);
                vector::push_back(&mut out_mag,  rounded_m);

                j_idx = j_idx + 1;
            };
            b_idx = b_idx + 1;
        };

        create_signed_fixed(out_shape, out_mag, out_sign, s)
    }

fun apply_relu_element(sign: u64, mag: u64): (u64, u64) {
    if (sign == 1) {
        (0, 0)
    } else {
        (sign, mag)
    }
}


public fun apply_dense_signed_fixed_2(
    input_tensor: &SignedFixedTensor,
    weight_tensor: &SignedFixedTensor,
    bias_tensor:   &SignedFixedTensor,
    activation_type: u64  
): SignedFixedTensor {
    let batch = *vector::borrow(&get_shape(input_tensor), 0);
    let in_dim = *vector::borrow(&get_shape(input_tensor), 1);
    let w_in = *vector::borrow(&get_shape(weight_tensor), 0);
    let w_out= *vector::borrow(&get_shape(weight_tensor), 1);
    let b_out= *vector::borrow(&get_shape(bias_tensor), 0);

    assert!(in_dim == w_in, 10001);
    assert!(w_out == b_out, 10002);

    let s =  get_scale(input_tensor);
    assert!(s == get_scale(weight_tensor), 10003);
    assert!(s == get_scale(bias_tensor),   10004);

    let mut out_shape = vector::empty<u64>();
    vector::push_back(&mut out_shape, batch);
    vector::push_back(&mut out_shape, w_out);

    let mut out_mag = vector::empty<u64>();
    let mut out_sign= vector::empty<u64>();

    let mut b_idx = 0;
    while (b_idx < batch) {
        let mut j_idx = 0;
        while (j_idx < w_out) {

            let mut acc_sgn = 0;
            let mut acc_mag = 0;

            let mut i_idx = 0;
            while (i_idx < in_dim) {
                let in_index = b_idx*in_dim + i_idx;
                let w_index  = i_idx*w_out + j_idx;
                                                   
                let in_s = *vector::borrow(& get_sign(input_tensor), in_index);
                let in_m = *vector::borrow(&get_magnitude(input_tensor), in_index);
                let w_s  = *vector::borrow(&get_sign(weight_tensor), w_index);
                let w_m  = *vector::borrow(&get_magnitude(weight_tensor), w_index);

                // 곱 => scale=2s
                let mul_s = if (in_s == w_s) { 0 } else { 1 };
                let mul_m = in_m * w_m;

                let (acc2_s, acc2_m) = signed_add_element(
                    acc_sgn, acc_mag,
                    mul_s,   mul_m
                );
                acc_sgn = acc2_s;
                acc_mag = acc2_m;

                i_idx = i_idx + 1;
            };

            let factor = scale_up(1, s);
            let b_s  = *vector::borrow(&get_sign(bias_tensor), j_idx);
            let b_m  = *vector::borrow(&get_magnitude(bias_tensor), j_idx);
            let b_m_2s = b_m * factor;

            let (acc3_s, acc3_m) = signed_add_element(
                acc_sgn, acc_mag,
                b_s,     b_m_2s
            );

            let (mut final_s, mut final_m) = if (activation_type == RELU) {
                apply_relu_element(acc3_s, acc3_m)
            } else {
                (acc3_s, acc3_m)
            };


            let divisor = scale_up(1, s);
            let rounded_m = final_m / divisor;

            vector::push_back(&mut out_sign, final_s);
            vector::push_back(&mut out_mag,  rounded_m);

            j_idx = j_idx + 1;
        };
        b_idx = b_idx + 1;
    };

    create_signed_fixed(out_shape, out_mag, out_sign, s)
}

    fun signed_add_element(
        s1: u64, m1: u64,
        s2: u64, m2: u64
    ): (u64, u64) {
        if (s1 == s2) {
            (s1, m1 + m2)
        } else {
            if (m1 >= m2) {
                (s1, m1 - m2)
            } else {
                (s2, m2 - m1)
            }
        }
    }

    public struct Layer has copy, drop {
        name: vector<u8>,          
        layer_type: vector<u8>,    
        input_nodes : u64,         
        output_nodes : u64,        
        weights: vector<u64>,      
        bias: vector<u64>,         
    }

    public struct Graph has drop {
        layers: vector<Layer>,     
    }

    public fun get_output_nodes(layer : &Layer) : u64 {
        layer.output_nodes 
    }

    public fun get_weights(layer: &Layer): vector<u64> {
        layer.weights 
    }

    public fun get_bias(layer: &Layer): vector<u64> {
        layer.bias 
    }

    public fun get_layer_type(layer: &Layer): &vector<u8> {
        &layer.layer_type 
    }

    public fun get_name(layer: &Layer): &vector<u8> {
        &layer.name 
    }

    public fun create(): Graph {
        Graph { layers: vector::empty<Layer>() } 
    }

    public fun add_layer(graph: &mut Graph, name: vector<u8>, layer_type: vector<u8>, input_nodes:u64, output_nodes:u64  ) {
        let weights : vector<u64> = initialize_weights(input_nodes, output_nodes);
        let bias : vector<u64> = initialize_bias(output_nodes);
        let layer = Layer { name, layer_type, input_nodes, output_nodes, weights, bias };
        vector::push_back(&mut graph.layers, layer);
    }

    public fun initialize_weights(input_nodes: u64, output_nodes:u64 ) : vector<u64> {
        let mut weights = vector::empty<u64>();
        let mut i = 0;
        while ( i < input_nodes * output_nodes) {
            vector::push_back(&mut weights, 1);
            i = i +1;
        };
        weights
    }

    public fun initialize_bias(output_nodes: u64): vector<u64> {
        let mut bias = vector::empty<u64>();

        let mut i = 0;
        while (i < output_nodes) {
            vector::push_back(&mut bias, 0);
            i = i + 1;
        };

        bias
    }

    public fun ReLu(weighted_sum : u64): u64 {
        if (weighted_sum > 0) {
            weighted_sum
        } else {
            0
        }
    }

    public fun Dense(graph: &mut Graph, input_nodes: u64, output_nodes: u64, name: vector<u8>): Layer {

        let weights = initialize_weights(input_nodes, output_nodes);
        let bias = initialize_bias(output_nodes);

        let layer = Layer {
            name,
            layer_type: b"dense",
            input_nodes,
            output_nodes,
            weights,
            bias,
        };

        vector::push_back(&mut graph.layers, layer);
        layer
    }

    public fun Input(graph: &mut Graph, name: vector<u8>): Layer {
        let layer = Layer {
            name,
            layer_type: b"input",
            input_nodes: 0,
            output_nodes: 0,
            weights: vector::empty<u64>(),
            bias: vector::empty<u64>(),
        };

        vector::push_back(&mut graph.layers, layer);
        layer
    }

    public fun set_layer_weights(graph: &mut Graph, name: vector<u8>, weights: vector<u64>, bias: vector<u64>) {
        let len = vector::length(&graph.layers);
        let mut i = 0;
        while (i < len) {
            let layer = vector::borrow_mut(&mut graph.layers, i);
            if (layer.name == name) {
                layer.weights = weights;
                layer.bias = bias;
                return;
            };
            i = i + 1;
        };
        abort 1; 
    }

    public fun get_layer(graph: &Graph, name: vector<u8>): &Layer {
        let mut i = 0;
        while (i < vector::length(&graph.layers)) {
            let layer = vector::borrow(&graph.layers, i);
            if (layer.name == name) {
                return layer;
            };
            i = i + 1;
        };
        abort 1
    }

    /* Decription  */
    public fun apply_dense(inputs: vector<u64>, weights: &vector<u64>, bias: &vector<u64>, output_nodes: u64): vector<u64> {
    let mut result = vector::empty<u64>();
    let input_size = vector::length(&inputs);
    let max_computation = input_size * output_nodes;

        std::debug::print(&std::string::utf8(b"input vector:"));
        debug::print(&inputs);

        std::debug::print(&std::string::utf8(b"input number:"));
        debug::print(&input_size);
        
        std::debug::print(&std::string::utf8(b"output number:"));
        debug::print(&output_nodes);

        std::debug::print(&std::string::utf8(b"max computation:"));
        debug::print(&max_computation);

        debug::print(weights);
        debug::print(bias);
        
        debug::print(&output_nodes);

    let mut i = 0;
    while (i < output_nodes) {
        let mut weighted_sum = 0;
        let mut j = 0;

        while (j < input_size) {
            let weight_index = i * (input_size) + j;
           
            std::debug::print(&std::string::utf8(b"i number:"));
            debug::print(&i);

            std::debug::print(&std::string::utf8(b"j number:"));
            debug::print(&j);

            std::debug::print(&std::string::utf8(b"weigth_index:"));
            debug::print(& weight_index);

            weighted_sum = weighted_sum + (inputs[j] * weights[weight_index]);
            j = j + 1;
        };

        weighted_sum = weighted_sum + *vector::borrow(bias, i);
        weighted_sum = ReLu(weighted_sum);
        vector::push_back(&mut result, weighted_sum);
        i = i + 1;
    };

    result
}

    public fun apply_conv2d(prev_output: vector<u64>, weights: &vector<u64>, bias: u64): vector<u64> {
        let mut result = vector::empty<u64>();
        let kernel_size = vector::length(weights);
        let prev_output_size = vector::length(&prev_output);

        let mut i = 0;
        while (i <= prev_output_size - kernel_size) {
            let mut conv_sum = 0;
            let mut j = 0;
            while (j < kernel_size) {
                conv_sum = conv_sum + (prev_output[i + j] * weights[j]);
                j = j + 1;
            };
            conv_sum = conv_sum + bias;
            vector::push_back(&mut result, conv_sum);
            i = i + 1;
        };
        result
    }

}
