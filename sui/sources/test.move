module ptb_test::example;

public entry fun f1(input: u64, ctx: &mut TxContext): u64 {
    let mut from = input;
    while (from < 100) {
        from = from + 1;
    };

    from
}

public entry fun f2(input: u64, ctx: &mut TxContext): u64 {
    let mut from = input;
    while (from < 20) {
        from = from + 1;
    };

    from
}

public entry fun f3(input: u64, ctx: &mut TxContext): u64 {
    let mut from = input;
    while (from < 40) {
        from = from + 1;
    };

    from
}

public entry fun f4(input: u64, ctx: &mut TxContext): u64 {
    let mut from = input;
    while (from < 60) {
        from = from + 1;
    };

    from
}

public entry fun f5(input: u64, ctx: &mut TxContext): u64 {
    let mut from = input;
    while (from < 80) {
        from = from + 1;
    };

    from
}

public entry fun f6(input: u64, ctx: &mut TxContext): u64 {
    let mut from = input;
    while (from < 100) {
        from = from + 1;
    };

    from
}