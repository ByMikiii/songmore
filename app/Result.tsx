export default function Result(rightGuess: boolean) {
  // fetch correct result

  // rightguess => null false true
  return(
    <section>
      {rightGuess === true ?
      <h1 className="text-green-400">u are correct</h1>
        :
      <h1 className="text-red-600">u are not correct</h1>
      }
    </section>
  );
}
