port module Main exposing (main)

import Browser
import Browser.Events
import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)
import Json.Decode


port changed : Int -> Cmd msg


port decrement : (Int -> msg) -> Sub msg


port increment : (Int -> msg) -> Sub msg


type Msg
    = Decrement Int
    | Increment Int
    | DocumentClicked


ignoreUpdate msg model =
    ( model, Cmd.none )


main : Program () { clickCount: Int, count : Int } Msg
main =
    Browser.element
        { init = \_ -> ( { clickCount = 0, count = 0 }, changed 0 )
        , subscriptions =
            \_ ->
                Sub.batch
                    [ decrement Decrement
                    , increment Increment
                    , Browser.Events.onClick (Json.Decode.succeed DocumentClicked)
                    ]
        , update =
            \msg model ->
                case msg of
                    Decrement amount ->
                        let
                            newCount =
                                model.count - amount
                        in
                        ( { model | count = newCount }, changed newCount )

                    Increment amount ->
                        let
                            newCount =
                                model.count + amount
                        in
                        ( { model | count = newCount }, changed newCount )

                    DocumentClicked ->
                        ( { model | clickCount = model.clickCount + 1}, Cmd.none )
        , view =
            \{ clickCount, count } ->
                div []
                    [ button [ onClick (Decrement 2) ] [ text "-" ]
                    , text (String.fromInt count)
                    , button [ onClick (Increment 3) ] [ text "+" ]
                    , div []
                        [ text "Clicks: "
                        , text (String.fromInt clickCount)
                        ]
                    ]
        }
